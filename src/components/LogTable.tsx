import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Inbox } from 'lucide-react';
import type { RequestRecord } from '@/types';

interface LogTableProps {
  records: RequestRecord[];
  onSelectRecord: (record: RequestRecord) => void;
}

export function LogTable({ records, onSelectRecord }: LogTableProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const displayRecords = [...records]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 100);

  const getDurationClass = (duration: number) => {
    if (duration < 200) return { color: '#16A34A' };
    if (duration < 1000) return { color: '#F59E0B' };
    return { color: '#DC2626' };
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-[10px] uppercase tracking-[0.12em]"
          style={{ color: '#6C757D', fontWeight: 600 }}
        >
          Log de Requisições
        </div>
        <div className="text-[11px] font-mono" style={{ color: '#ADB5BD' }}>
          {displayRecords.length} registros
        </div>
      </div>

      <ScrollArea className="h-[360px]">
        {displayRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3" style={{ color: '#ADB5BD' }}>
            <Inbox className="w-10 h-10 opacity-40" />
            <div className="text-sm text-center">
              Nenhuma requisição realizada ainda.
              <br />
              <span className="text-xs">Configure um endpoint e clique em Iniciar.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 pr-2">
            {displayRecords.map((record) => {
              const durStyle = getDurationClass(record.duration);
              const time = new Date(record.timestamp).toLocaleTimeString('pt-BR');
              return (
                <button
                  key={record.id || record.timestamp}
                  onClick={() => onSelectRecord(record)}
                  className="w-full text-left grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-3 py-2.5 rounded-lg transition-all duration-150 hover:translate-x-[3px]"
                  style={{
                    background: '#F8F9FA',
                    borderLeft: `3px solid ${record.success ? '#16A34A' : '#DC2626'}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F3F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F8F9FA';
                  }}
                >
                  <span className="text-xs font-mono truncate" style={{ color: '#6C757D' }}>
                    {record.seqId || record.epName}
                  </span>
                  <span className="text-xs font-mono" style={{ color: '#6C757D' }}>
                    {time}
                  </span>
                  <span className="text-xs font-mono font-bold" style={durStyle}>
                    {record.duration}ms
                  </span>
                  <span className="flex items-center gap-1">
                    {record.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-mono" style={{ color: '#DC2626' }}>
                        <XCircle className="w-3.5 h-3.5" />
                        {record.statusCode || 'Err'}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
