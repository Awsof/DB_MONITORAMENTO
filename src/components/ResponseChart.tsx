import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import type { RequestRecord } from '@/types';

interface ResponseChartProps {
  records: RequestRecord[];
}

export function ResponseChart({ records }: ResponseChartProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRecords = records
    .filter((r) => r.timestamp >= today.getTime())
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-60);

  const data = todayRecords.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    duration: r.duration,
    success: r.success,
  }));

  const timeLabel =
    todayRecords.length > 0
      ? `${new Date(todayRecords[0].timestamp).toLocaleTimeString('pt-BR')} → ${new Date(
          todayRecords[todayRecords.length - 1].timestamp
        ).toLocaleTimeString('pt-BR')}`
      : 'Sem dados hoje';

  return (
    <div
      className="rounded-xl p-5 mb-4"
      style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="text-[10px] uppercase tracking-[0.12em]"
          style={{ color: '#6C757D', fontWeight: 600 }}
        >
          Histórico de Tempo de Resposta
        </div>
        <div className="text-[11px] font-mono" style={{ color: '#ADB5BD' }}>
          {timeLabel}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: '#ADB5BD' }}>
          Nenhum dado para exibir
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1BBFB3" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#1BBFB3" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#ADB5BD', fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={{ stroke: '#E9ECEF' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#ADB5BD', fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}ms`}
            />
            <Tooltip
              contentStyle={{
                background: '#0B1B2B',
                border: '1px solid #1A3A52',
                borderRadius: 8,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: '#fff',
              }}
              labelStyle={{ color: '#1BBFB3', marginBottom: 4 }}
              formatter={(value: number, _name: string, props: any) => {
                const success = props?.payload?.success;
                return [`${value}ms`, success ? '✓ Sucesso' : '✗ Falha'];
              }}
            />
            <Area
              type="monotone"
              dataKey="duration"
              fill="url(#areaFill)"
              stroke="none"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="duration"
              stroke="#1BBFB3"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const color = payload?.success ? '#16A34A' : '#DC2626';
                return (
                  <circle
                    key={`${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={color}
                    stroke="none"
                  />
                );
              }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
