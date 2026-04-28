import { Globe, Play, Square, FileText, Trash2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isRunning: boolean;
  onStartAll: () => void;
  onStopAll: () => void;
  onGenerateReport: () => void;
  onClearAll: () => void;
}

export function Header({ isRunning, onStartAll, onStopAll, onGenerateReport, onClearAll }: HeaderProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(90deg, #0B1B2B, #13293D)',
        borderBottom: '2px solid #D4AF37',
      }}
    >
      <div className="flex items-center gap-3">
        <Globe className="w-7 h-7 text-[#1BBFB3]" />
        <div>
          <h1 className="text-white font-bold text-base tracking-tight leading-tight">
            XML WebService Sender Pro
          </h1>
          <p
            className="text-[10px] tracking-[0.15em] uppercase"
            style={{ color: '#3D5A80' }}
          >
            SOAP / REST XML Performance Monitor
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full mr-2"
          style={{
            background: '#0B1B2B',
            border: '1px solid #1A3A52',
          }}
        >
          <Activity
            className={`w-3.5 h-3.5 ${isRunning ? 'text-green-400' : 'text-gray-400'}`}
            style={isRunning ? { filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.6))' } : {}}
          />
          <span
            className="text-xs font-mono"
            style={{ color: '#3D5A80' }}
          >
            {isRunning ? 'Executando' : 'Parado'}
          </span>
        </div>

        <Button
          size="sm"
          onClick={onStartAll}
          className="bg-[#1BBFB3] hover:bg-[#16A89E] text-white font-semibold text-xs gap-1.5 h-8 px-3"
          style={{ borderRadius: 8 }}
        >
          <Play className="w-3.5 h-3.5" /> Iniciar Todos
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onStopAll}
          className="text-white border-white/30 hover:bg-white/10 font-semibold text-xs gap-1.5 h-8 px-3"
          style={{ borderRadius: 8 }}
        >
          <Square className="w-3.5 h-3.5" /> Parar
        </Button>

        <Button
          size="sm"
          onClick={onGenerateReport}
          className="text-white font-semibold text-xs gap-1.5 h-8 px-3"
          style={{ borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
        >
          <FileText className="w-3.5 h-3.5" /> Relatório
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onClearAll}
          className="text-gray-400 border-gray-500/30 hover:border-red-400 hover:text-red-400 font-semibold text-xs gap-1.5 h-8 px-3"
          style={{ borderRadius: 8 }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Limpar
        </Button>
      </div>
    </header>
  );
}
