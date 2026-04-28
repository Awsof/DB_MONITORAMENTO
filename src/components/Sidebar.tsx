import { Plus, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EndpointCard } from './EndpointCard';
import type { Endpoint } from '@/types';
import { useState } from 'react';

interface SidebarProps {
  endpoints: Endpoint[];
  globalInterval: number;
  corsWarning: boolean;
  onIntervalChange: (val: number) => void;
  onAddEndpoint: () => void;
  onUpdateEndpoint: (id: string, field: keyof Endpoint, value: string | number) => void;
  onToggleEndpoint: (id: string) => void;
  onRemoveEndpoint: (id: string) => void;
  onStartAll: () => void;
  onStopAll: () => void;
}

export function Sidebar({
  endpoints,
  globalInterval,
  corsWarning,
  onIntervalChange,
  onAddEndpoint,
  onUpdateEndpoint,
  onToggleEndpoint,
  onRemoveEndpoint,
  onStartAll,
  onStopAll,
}: SidebarProps) {
  const [collapsedCors, setCollapsedCors] = useState(false);

  return (
    <aside
      className="w-80 flex-shrink-0 overflow-y-auto"
      style={{
        background: '#0B1B2B',
        padding: 20,
        height: 'calc(100vh - 64px)',
      }}
    >
      {corsWarning && !collapsedCors && (
        <div
          className="p-3 rounded-lg mb-4 relative text-xs font-mono"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            color: '#F59E0B',
          }}
        >
          <button
            onClick={() => setCollapsedCors(true)}
            className="absolute top-1.5 right-1.5 opacity-60 hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
          <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
          CORS bloqueado — instale{' '}
          <a
            href="https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: '#1BBFB3' }}
          >
            Allow CORS
          </a>{' '}
          ou use proxy.
        </div>
      )}

      <div className="mb-4">
        <div
          className="text-[10px] uppercase tracking-[0.15em] mb-3 pb-1.5"
          style={{ color: '#3D5A80', borderBottom: '1px solid #1A3A52' }}
        >
          Intervalo Global
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-shrink-0">
            <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: '#3D5A80' }}>
              Segundos
            </label>
            <input
              type="number"
              min={1}
              max={3600}
              value={globalInterval}
              onChange={(e) => onIntervalChange(parseInt(e.target.value) || 10)}
              className="w-20 px-2.5 py-1.5 rounded-md text-xs font-mono text-white outline-none"
              style={{ background: '#0B1B2B', border: '1px solid #1A3A52' }}
            />
          </div>
          <div className="flex gap-1.5 ml-auto">
            <Button
              size="sm"
              onClick={onStartAll}
              className="bg-[#1BBFB3] hover:bg-[#16A89E] text-white font-bold text-[11px] gap-1 h-8 px-2.5"
              style={{ borderRadius: 8 }}
            >
              <Plus className="w-3 h-3 rotate-0" style={{ display: 'none' }} />
              <span className="text-xs">▶</span> Iniciar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onStopAll}
              className="text-white border-white/30 hover:bg-white/10 font-bold text-[11px] h-8 px-2.5"
              style={{ borderRadius: 8 }}
            >
              ⏹ Parar
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div
          className="text-[10px] uppercase tracking-[0.15em] mb-3 pb-1.5"
          style={{ color: '#3D5A80', borderBottom: '1px solid #1A3A52' }}
        >
          Endpoints
        </div>
        <div className="space-y-2.5">
          {endpoints.map((ep) => (
            <EndpointCard
              key={ep.id}
              endpoint={ep}
              onUpdate={onUpdateEndpoint}
              onToggle={onToggleEndpoint}
              onRemove={onRemoveEndpoint}
            />
          ))}
        </div>
        <button
          onClick={onAddEndpoint}
          className="w-full mt-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
          style={{
            border: '1px dashed #1A3A52',
            color: '#3D5A80',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1BBFB3';
            e.currentTarget.style.color = '#1BBFB3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1A3A52';
            e.currentTarget.style.color = '#3D5A80';
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Endpoint
        </button>
      </div>
    </aside>
  );
}
