import { useEffect, useRef, useCallback } from 'react';
import type { Endpoint, RequestRecord } from '@/types';

const DB_NAME = 'XMLMonitorDB';
const DB_VERSION = 1;

export function useIndexedDB() {
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(() => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('requests')) {
        const store = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
        store.createIndex('epId', 'epId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => {
      dbRef.current = (e.target as IDBOpenDBRequest).result;
    };
    req.onerror = () => {
      console.error('Failed to open IndexedDB');
    };
  }, []);

  const saveRequest = useCallback(async (record: RequestRecord) => {
    return new Promise<void>((resolve) => {
      if (!dbRef.current) { resolve(); return; }
      const tx = dbRef.current.transaction('requests', 'readwrite');
      tx.objectStore('requests').add(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }, []);

  const getRequestsByEp = useCallback(async (epId: string) => {
    return new Promise<RequestRecord[]>((resolve) => {
      if (!dbRef.current) { resolve([]); return; }
      const tx = dbRef.current.transaction('requests', 'readonly');
      const index = tx.objectStore('requests').index('epId');
      const req = index.getAll(epId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }, []);

  const getAllRequests = useCallback(async () => {
    return new Promise<RequestRecord[]>((resolve) => {
      if (!dbRef.current) { resolve([]); return; }
      const tx = dbRef.current.transaction('requests', 'readonly');
      const req = tx.objectStore('requests').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }, []);

  const clearRequests = useCallback(async () => {
    return new Promise<void>((resolve) => {
      if (!dbRef.current) { resolve(); return; }
      const tx = dbRef.current.transaction('requests', 'readwrite');
      tx.objectStore('requests').clear().onsuccess = () => resolve();
      tx.onerror = () => resolve();
    });
  }, []);

  const saveConfig = useCallback(async (endpoints: Endpoint[], globalInterval: number) => {
    return new Promise<void>((resolve) => {
      if (!dbRef.current) { resolve(); return; }
      const tx = dbRef.current.transaction('config', 'readwrite');
      const store = tx.objectStore('config');
      store.put({ key: 'endpoints', value: endpoints.map(e => ({ ...e, intervalId: null })) });
      store.put({ key: 'interval', value: globalInterval });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }, []);

  const loadConfig = useCallback(async () => {
    return new Promise<{ endpoints: Endpoint[] | null; interval: number }>((resolve) => {
      if (!dbRef.current) { resolve({ endpoints: null, interval: 10 }); return; }
      const tx = dbRef.current.transaction('config', 'readonly');
      const store = tx.objectStore('config');
      const req = store.get('endpoints');
      req.onsuccess = () => {
        const ivReq = store.get('interval');
        ivReq.onsuccess = () => {
          resolve({
            endpoints: req.result ? req.result.value : null,
            interval: ivReq.result ? ivReq.result.value : 10,
          });
        };
        ivReq.onerror = () => resolve({ endpoints: req.result ? req.result.value : null, interval: 10 });
      };
      req.onerror = () => resolve({ endpoints: null, interval: 10 });
    });
  }, []);

  return { dbRef, saveRequest, getRequestsByEp, getAllRequests, clearRequests, saveConfig, loadConfig };
}
