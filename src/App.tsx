import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MetricsRow } from '@/components/MetricsRow';
import { ResponseChart } from '@/components/ResponseChart';
import { LogTable } from '@/components/LogTable';
import { ResponseModal } from '@/components/ResponseModal';
import { Toast } from '@/components/Toast';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import type { Endpoint, RequestRecord } from '@/types';

const DEFAULT_XML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:diag="http://diagnosticosdobrasil.com.br">
   <soapenv:Header/>
   <soapenv:Body>
      <diag:RecebeAtendimento>
         <diag:atendimento>
            <diag:CodigoApoiado>12588</diag:CodigoApoiado>
            <diag:CodigoSenhaIntegracao>hovaho23</diag:CodigoSenhaIntegracao>
            <diag:Pedido>
               <diag:NumeroAtendimentoApoiado>{{SEQ_ID}}</diag:NumeroAtendimentoApoiado>
               <diag:ListaPacienteApoiado>
                  <diag:NomePaciente>TESTE DB</diag:NomePaciente>
                  <diag:SexoPaciente>F</diag:SexoPaciente>
                  <diag:DataHoraPaciente>1989-09-27T00:00:00</diag:DataHoraPaciente>
               </diag:ListaPacienteApoiado>
               <diag:ListaProcedimento>
                  <diag:ct_Procedimento_v2><diag:CodigoExameDB>CC4</diag:CodigoExameDB></diag:ct_Procedimento_v2>
                  <diag:ct_Procedimento_v2><diag:CodigoExameDB>TSH</diag:CodigoExameDB></diag:ct_Procedimento_v2>
                  <diag:ct_Procedimento_v2><diag:CodigoExameDB>VB12</diag:CodigoExameDB></diag:ct_Procedimento_v2>
               </diag:ListaProcedimento>
            </diag:Pedido>
         </diag:atendimento>
      </diag:RecebeAtendimento>
   </soapenv:Body>
</soapenv:Envelope>`;

const DEFAULT_ENDPOINT = 'https://wsmp.diagnosticosdobrasil.com.br/chivor/wsrvProtocoloDBSync.CHIVOR.svc';
const DEFAULT_SOAP_ACTION = 'http://diagnosticosdobrasil.com.br/RecebeAtendimento';

function generateSeqId(ep: Endpoint): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  ep.seqCounter = (ep.seqCounter || 0) + 1;
  const seq = String(ep.seqCounter).padStart(2, '0');
  const prefix = (ep.prefix || 'AWS').toUpperCase().replace(/\s/g, '').substring(0, 10);
  return `${prefix}${dd}${mm}${yyyy}${hh}${min}.${seq}`;
}

export default function App() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [activeEpId, setActiveEpId] = useState<string>('__all__');
  const [globalInterval, setGlobalInterval] = useState(10);
  const [filteredRecords, setFilteredRecords] = useState<RequestRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RequestRecord | null>(null);
  const [corsWarning, setCorsWarning] = useState(false);
  const [toast, setToast] = useState({ message: '', isError: false, visible: false });

  const { dbRef, saveRequest, getRequestsByEp, getAllRequests, clearRequests, saveConfig, loadConfig } =
    useIndexedDB();
  const initialized = useRef(false);
  const epStateRef = useRef<Endpoint[]>([]);

  useEffect(() => {
    epStateRef.current = endpoints;
  }, [endpoints]);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError, visible: true });
  }, []);

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const addEndpoint = useCallback(() => {
    const newEp: Endpoint = {
      id: 'ep_' + Date.now(),
      name: 'Endpoint ' + (epStateRef.current.length + 1),
      url: DEFAULT_ENDPOINT,
      soapAction: DEFAULT_SOAP_ACTION,
      xml: DEFAULT_XML,
      prefix: 'AWS',
      seqCounter: 0,
      intervalId: null,
      corsErrors: 0,
    };
    const updated = [...epStateRef.current, newEp];
    setEndpoints(updated);
    if (activeEpId === '__all__' && updated.length === 1) {
      setActiveEpId(newEp.id);
    }
    saveConfig(updated, globalInterval);
  }, [activeEpId, globalInterval, saveConfig]);

  const updateEndpoint = useCallback(
    (id: string, field: keyof Endpoint, value: string | number) => {
      const updated = epStateRef.current.map((e) => (e.id === id ? { ...e, [field]: value } : e));
      setEndpoints(updated);
      saveConfig(updated, globalInterval);
    },
    [globalInterval, saveConfig]
  );

  const refreshRecords = useCallback(async () => {
    if (!dbRef.current) return;
    let records: RequestRecord[];
    if (activeEpId === '__all__') {
      records = await getAllRequests();
    } else {
      records = await getRequestsByEp(activeEpId);
    }
    setFilteredRecords(records);
  }, [activeEpId, getAllRequests, getRequestsByEp, dbRef]);

  const fireRequest = useCallback(
    async (ep: Endpoint) => {
      const seqId = generateSeqId(ep);
      const xmlBody = ep.xml.replace(/\{\{SEQ_ID\}\}/g, seqId);
      const headers: Record<string, string> = {
        'Content-Type': 'text/xml; charset=utf-8',
        Accept: 'text/xml, application/xml',
      };
      if (ep.soapAction) headers['SOAPAction'] = '"' + ep.soapAction + '"';

      const t0 = performance.now();
      let duration = 0;
      let success = false;
      let statusCode = 0;
      let responseText = '';

      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 30000);
        const res = await fetch(ep.url, {
          method: 'POST',
          headers,
          body: xmlBody,
          signal: ctrl.signal,
          mode: 'cors',
          credentials: 'omit',
        });
        clearTimeout(tid);
        statusCode = res.status;
        responseText = await res.text();
        duration = Math.round(performance.now() - t0);
        success = res.ok;

        if (success) {
          setCorsWarning(false);
          setEndpoints((prev) =>
            prev.map((e) => (e.id === ep.id ? { ...e, corsErrors: 0 } : e))
          );
        }
      } catch (err: any) {
        duration = Math.round(performance.now() - t0);
        responseText =
          err.name === 'AbortError'
            ? 'Timeout: requisição excedeu 30s'
            : `Erro: ${err.message}`;

        if (err.name === 'TypeError') {
          setEndpoints((prev) =>
            prev.map((e) => {
              if (e.id !== ep.id) return e;
              const newCount = (e.corsErrors || 0) + 1;
              if (newCount >= 2) setCorsWarning(true);
              return { ...e, corsErrors: newCount };
            })
          );
        }
      }

      const record: RequestRecord = {
        epId: ep.id,
        epName: ep.name,
        seqId,
        timestamp: Date.now(),
        duration,
        success,
        statusCode,
        response: responseText,
      };

      await saveRequest(record);
      refreshRecords();
    },
    [saveRequest, refreshRecords]
  );

  const toggleEndpoint = useCallback(
    (id: string) => {
      const ep = epStateRef.current.find((e) => e.id === id);
      if (!ep) return;

      if (ep.intervalId) {
        clearInterval(ep.intervalId);
        setEndpoints((prev) =>
          prev.map((e) => (e.id === id ? { ...e, intervalId: null } : e))
        );
        showToast(`⏹ ${ep.name} parado`);
      } else {
        fireRequest(ep);
        const iv = setInterval(() => {
          const currentEp = epStateRef.current.find((e) => e.id === id);
          if (currentEp) fireRequest(currentEp);
        }, globalInterval * 1000);
        setEndpoints((prev) =>
          prev.map((e) => (e.id === id ? { ...e, intervalId: iv as unknown as number } : e))
        );
        showToast(`▶ ${ep.name} iniciado`);
      }
      setTimeout(() => saveConfig(epStateRef.current, globalInterval), 100);
    },
    [fireRequest, globalInterval, showToast, saveConfig]
  );

  const removeEndpoint = useCallback(
    (id: string) => {
      const ep = epStateRef.current.find((e) => e.id === id);
      if (ep?.intervalId) clearInterval(ep.intervalId);
      const updated = epStateRef.current.filter((e) => e.id !== id);
      setEndpoints(updated);
      if (activeEpId === id) {
        setActiveEpId(updated.length ? updated[0].id : '__all__');
      }
      saveConfig(updated, globalInterval);
    },
    [activeEpId, globalInterval, saveConfig]
  );

  const startAll = useCallback(() => {
    epStateRef.current.forEach((ep) => {
      if (!ep.intervalId) toggleEndpoint(ep.id);
    });
  }, [toggleEndpoint]);

  const stopAll = useCallback(() => {
    epStateRef.current.forEach((ep) => {
      if (ep.intervalId) {
        clearInterval(ep.intervalId);
      }
    });
    setEndpoints((prev) => prev.map((e) => ({ ...e, intervalId: null })));
    saveConfig(
      epStateRef.current.map((e) => ({ ...e, intervalId: null })),
      globalInterval
    );
    showToast('⏹ Todos os endpoints parados');
  }, [globalInterval, saveConfig, showToast]);

  const handleIntervalChange = useCallback(
    (val: number) => {
      setGlobalInterval(val);
      saveConfig(epStateRef.current, val);
    },
    [saveConfig]
  );

  const handleClearAll = useCallback(async () => {
    if (!confirm('Deseja limpar todos os dados de requisições?')) return;
    stopAll();
    await clearRequests();
    setEndpoints((prev) => prev.map((e) => ({ ...e, seqCounter: 0 })));
    refreshRecords();
    showToast('🗑️ Dados limpos');
  }, [stopAll, clearRequests, refreshRecords, showToast]);

  const handleGenerateReport = useCallback(async () => {
    const all = await getAllRequests();
    if (!all.length) {
      showToast('❌ Sem dados para gerar relatório', true);
      return;
    }

    const byEp: Record<string, { name: string; records: RequestRecord[] }> = {};
    all.forEach((r) => {
      if (!byEp[r.epId]) byEp[r.epId] = { name: r.epName, records: [] };
      byEp[r.epId].records.push(r);
    });

    let sections = '';
    for (const epId in byEp) {
      const { name, records } = byEp[epId];
      records.sort((a, b) => a.timestamp - b.timestamp);
      const times = records.map((r) => r.duration);
      const min = Math.min(...times);
      const max = Math.max(...times);
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const successRate = Math.round((records.filter((r) => r.success).length / records.length) * 100);

      sections += `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:22px;margin-bottom:20px">
          <h2 style="font-size:1rem;color:#1BBFB3;margin-bottom:14px">${escHtml(name)}</h2>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
            <div style="background:#f8f9fa;border-radius:8px;padding:10px 16px;text-align:center">
              <span style="display:block;font-size:10px;color:#6b7280;text-transform:uppercase;margin-bottom:4px">Mínimo</span>
              <strong style="font-size:1.2rem;color:#16a34a">${min}ms</strong>
            </div>
            <div style="background:#f8f9fa;border-radius:8px;padding:10px 16px;text-align:center">
              <span style="display:block;font-size:10px;color:#6b7280;text-transform:uppercase;margin-bottom:4px">Máximo</span>
              <strong style="font-size:1.2rem;color:#dc2626">${max}ms</strong>
            </div>
            <div style="background:#f8f9fa;border-radius:8px;padding:10px 16px;text-align:center">
              <span style="display:block;font-size:10px;color:#6b7280;text-transform:uppercase;margin-bottom:4px">Média</span>
              <strong style="font-size:1.2rem;color:#f59e0b">${avg}ms</strong>
            </div>
            <div style="background:#f8f9fa;border-radius:8px;padding:10px 16px;text-align:center">
              <span style="display:block;font-size:10px;color:#6b7280;text-transform:uppercase;margin-bottom:4px">Taxa Sucesso</span>
              <strong style="font-size:1.2rem;color:#1BBFB3">${successRate}%</strong>
            </div>
            <div style="background:#f8f9fa;border-radius:8px;padding:10px 16px;text-align:center">
              <span style="display:block;font-size:10px;color:#6b7280;text-transform:uppercase;margin-bottom:4px">Requisições</span>
              <strong style="font-size:1.2rem">${records.length}</strong>
            </div>
          </div>
        </div>`;
    }

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório XML Monitor — ${new Date().toLocaleString('pt-BR')}</title></head>
    <body style="font-family:system-ui,sans-serif;background:#f8f9fa;color:#1f2933;padding:30px;max-width:900px;margin:auto">
    <h1 style="font-size:1.4rem;margin-bottom:4px;color:#0B1B2B">📊 Relatório XML WebService Sender Pro</h1>
    <div style="color:#6b7280;font-size:13px;margin-bottom:24px">Gerado em: ${new Date().toLocaleString('pt-BR')} · Endpoints: ${Object.keys(byEp).length} · Total de requisições: ${all.length}</div>
    ${sections}
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `XMLMonitor_Report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    showToast('📊 Relatório gerado com sucesso!');
  }, [getAllRequests, showToast]);

  const isRunning = endpoints.some((e) => e.intervalId !== null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const cfg = await loadConfig();
      if (cfg.interval) setGlobalInterval(cfg.interval);

      if (cfg.endpoints && cfg.endpoints.length > 0) {
        const eps = cfg.endpoints.map((e: Endpoint) => ({ ...e, intervalId: null, corsErrors: 0 }));
        setEndpoints(eps);
        setActiveEpId(eps[0].id);
      } else {
        const defaultEp: Endpoint = {
          id: 'ep_' + Date.now(),
          name: 'Endpoint 1',
          url: DEFAULT_ENDPOINT,
          soapAction: DEFAULT_SOAP_ACTION,
          xml: DEFAULT_XML,
          prefix: 'AWS',
          seqCounter: 0,
          intervalId: null,
          corsErrors: 0,
        };
        setEndpoints([defaultEp]);
        setActiveEpId(defaultEp.id);
        saveConfig([defaultEp], cfg.interval || 10);
      }
      refreshRecords();
    };

    init();
  }, [loadConfig, saveConfig, refreshRecords]);

  useEffect(() => {
    refreshRecords();
  }, [activeEpId, refreshRecords]);

  useEffect(() => {
    const id = setInterval(() => {
      refreshRecords();
    }, 5000);
    return () => clearInterval(id);
  }, [refreshRecords]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopAll]);

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FA' }}>
      <Header
        isRunning={isRunning}
        onStartAll={startAll}
        onStopAll={stopAll}
        onGenerateReport={handleGenerateReport}
        onClearAll={handleClearAll}
      />

      <div className="flex pt-16">
        <Sidebar
          endpoints={endpoints}
          globalInterval={globalInterval}
          corsWarning={corsWarning}
          onIntervalChange={handleIntervalChange}
          onAddEndpoint={addEndpoint}
          onUpdateEndpoint={updateEndpoint}
          onToggleEndpoint={toggleEndpoint}
          onRemoveEndpoint={removeEndpoint}
          onStartAll={startAll}
          onStopAll={stopAll}
        />

        <main className="flex-1 p-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setActiveEpId(ep.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200"
                style={{
                  background: activeEpId === ep.id ? '#1BBFB3' : 'transparent',
                  border: `1px solid ${activeEpId === ep.id ? '#1BBFB3' : '#ADB5BD'}`,
                  color: activeEpId === ep.id ? '#000' : '#6C757D',
                  fontWeight: activeEpId === ep.id ? 700 : 400,
                }}
              >
                {ep.name}
              </button>
            ))}
            <button
              onClick={() => setActiveEpId('__all__')}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200"
              style={{
                background: activeEpId === '__all__' ? '#1BBFB3' : 'transparent',
                border: `1px solid ${activeEpId === '__all__' ? '#1BBFB3' : '#ADB5BD'}`,
                color: activeEpId === '__all__' ? '#000' : '#6C757D',
                fontWeight: activeEpId === '__all__' ? 700 : 400,
              }}
            >
              Todos
            </button>
          </div>

          <MetricsRow records={filteredRecords} />
          <ResponseChart records={filteredRecords} />
          <LogTable records={filteredRecords} onSelectRecord={setSelectedRecord} />
        </main>
      </div>

      <ResponseModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      <Toast
        message={toast.message}
        isError={toast.isError}
        visible={toast.visible}
        onDismiss={dismissToast}
      />
    </div>
  );
}

function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
