import type { RequestRecord } from '@/types';

interface MetricsRowProps {
  records: RequestRecord[];
}

export function MetricsRow({ records }: MetricsRowProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRecords = records.filter((r) => r.timestamp >= today.getTime());
  const times = todayRecords.map((r) => r.duration);

  const metrics = [
    {
      label: 'Última Resposta',
      value: times.length > 0 ? times[times.length - 1] : null,
      unit: 'ms',
      accent: '#1BBFB3',
      valueColor: '#1BBFB3',
    },
    {
      label: 'Mínimo',
      value: times.length > 0 ? Math.min(...times) : null,
      unit: 'ms',
      accent: '#16A34A',
      valueColor: '#16A34A',
    },
    {
      label: 'Máximo',
      value: times.length > 0 ? Math.max(...times) : null,
      unit: 'ms',
      accent: '#DC2626',
      valueColor: '#DC2626',
    },
    {
      label: 'Média',
      value: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null,
      unit: 'ms',
      accent: '#F59E0B',
      valueColor: '#F59E0B',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3.5 mb-5">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-xl p-4"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            borderTop: `3px solid ${m.accent}`,
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.12em] mb-2"
            style={{ color: '#6C757D', fontWeight: 600 }}
          >
            {m.label}
          </div>
          <div className="text-2xl font-extrabold font-mono leading-none" style={{ color: m.valueColor }}>
            {m.value !== null ? m.value : '—'}
          </div>
          <div className="text-[11px] font-mono mt-0.5" style={{ color: '#ADB5BD' }}>
            {m.unit}
          </div>
        </div>
      ))}
    </div>
  );
}
