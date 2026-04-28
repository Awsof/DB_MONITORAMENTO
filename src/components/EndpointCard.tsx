import { Play, Square, X } from 'lucide-react';
import type { Endpoint } from '@/types';

interface EndpointCardProps {
  endpoint: Endpoint;
  onUpdate: (id: string, field: keyof Endpoint, value: string | number) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function generatePreviewId(ep: Endpoint): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const prefix = (ep.prefix || 'AWS').toUpperCase().substring(0, 10);
  const seq = String((ep.seqCounter || 0) + 1).padStart(2, '0');
  return `${prefix}${dd}${mm}${yyyy}${hh}${min}.${seq}`;
}

export function EndpointCard({ endpoint, onUpdate, onToggle, onRemove }: EndpointCardProps) {
  const isActive = endpoint.intervalId !== null;

  return (
    <div
      className="p-3.5 rounded-xl transition-all duration-200"
      style={{
        background: '#13293D',
        border: `1px solid ${isActive ? '#1BBFB3' : '#1A3A52'}`,
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <input
          type="text"
          value={endpoint.name}
          onChange={(e) => onUpdate(endpoint.id, 'name', e.target.value)}
          className="bg-transparent text-white font-bold text-sm border-none outline-none w-36"
          placeholder="Nome do Endpoint"
        />
        <div className="flex gap-1.5">
          <button
            onClick={() => onToggle(endpoint.id)}
            className="px-2 py-1 rounded-md text-xs font-mono transition-all duration-150"
            style={{
              border: `1px solid ${isActive ? '#16A34A' : '#1BBFB3'}`,
              color: isActive ? '#16A34A' : '#1BBFB3',
              background: isActive ? 'rgba(22,163,74,0.1)' : 'transparent',
            }}
            title={isActive ? 'Parar' : 'Iniciar'}
          >
            {isActive ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={() => onRemove(endpoint.id)}
            className="px-2 py-1 rounded-md text-xs font-mono transition-all duration-150 hover:border-red-400 hover:text-red-400"
            style={{ border: '1px solid #3D5A80', color: '#3D5A80' }}
            title="Remover"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: '#3D5A80' }}>
            URL
          </label>
          <input
            type="text"
            value={endpoint.url}
            onChange={(e) => onUpdate(endpoint.id, 'url', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md text-xs font-mono text-white outline-none transition-colors"
            style={{ background: '#0B1B2B', border: '1px solid #1A3A52' }}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: '#3D5A80' }}>
            SOAP Action
          </label>
          <input
            type="text"
            value={endpoint.soapAction}
            onChange={(e) => onUpdate(endpoint.id, 'soapAction', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md text-xs font-mono text-white outline-none transition-colors"
            style={{ background: '#0B1B2B', border: '1px solid #1A3A52' }}
            placeholder="SOAPAction"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: '#3D5A80' }}>
              Prefixo ID
            </label>
            <input
              type="text"
              value={endpoint.prefix}
              onChange={(e) => onUpdate(endpoint.id, 'prefix', e.target.value.toUpperCase())}
              maxLength={10}
              className="w-full px-2.5 py-1.5 rounded-md text-xs font-mono text-white outline-none transition-colors"
              style={{ background: '#0B1B2B', border: '1px solid #1A3A52' }}
              placeholder="AWS"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: '#3D5A80' }}>
              Seq. Atual
            </label>
            <input
              type="number"
              value={endpoint.seqCounter}
              onChange={(e) => onUpdate(endpoint.id, 'seqCounter', parseInt(e.target.value) || 0)}
              min={0}
              className="w-full px-2.5 py-1.5 rounded-md text-xs font-mono text-white outline-none transition-colors"
              style={{ background: '#0B1B2B', border: '1px solid #1A3A52' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: '#3D5A80' }}>
            XML Payload
          </label>
          <textarea
            value={endpoint.xml}
            onChange={(e) => onUpdate(endpoint.id, 'xml', e.target.value)}
            rows={4}
            className="w-full px-2.5 py-1.5 rounded-md text-[11px] font-mono text-white outline-none transition-colors resize-y"
            style={{ background: '#0B1B2B', border: '1px solid #1A3A52', lineHeight: 1.5, minHeight: 80 }}
          />
        </div>

        <div
          className="inline-block px-2 py-0.5 rounded mt-1 text-[11px] font-mono"
          style={{
            background: 'rgba(27,191,179,0.1)',
            border: '1px solid rgba(27,191,179,0.2)',
            color: '#1BBFB3',
          }}
        >
          Próximo ID: {generatePreviewId(endpoint)}
        </div>
      </div>
    </div>
  );
}
