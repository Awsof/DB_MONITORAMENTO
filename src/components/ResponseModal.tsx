import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { RequestRecord } from '@/types';

interface ResponseModalProps {
  record: RequestRecord | null;
  onClose: () => void;
}

export function ResponseModal({ record, onClose }: ResponseModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (record) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [record, onClose]);

  if (!record) return null;

  const timeStr = new Date(record.timestamp).toLocaleString('pt-BR');

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          maxWidth: 720,
          width: '90%',
          maxHeight: '80vh',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          animation: 'scaleIn 0.2s ease',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#E9ECEF' }}>
          <div>
            <div className="text-xs font-mono font-semibold" style={{ color: '#1BBFB3' }}>
              {record.seqId || record.epName}
            </div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: '#ADB5BD' }}>
              {timeStr} · {record.duration}ms · {record.success ? '✓ Sucesso' : `✗ HTTP ${record.statusCode}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#6C757D' }} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          <textarea
            readOnly
            value={record.response || '(sem resposta)'}
            className="w-full h-96 p-3 rounded-lg font-mono text-xs resize-none outline-none"
            style={{
              background: '#F8F9FA',
              border: '1px solid #E9ECEF',
              color: '#495057',
              lineHeight: 1.6,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
