import { CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isError: boolean;
  visible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, isError, visible, onDismiss }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onDismiss, 300);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible && !show) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[900] flex items-center gap-2.5 px-5 py-3 rounded-lg"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        borderLeft: `3px solid ${isError ? '#DC2626' : '#1BBFB3'}`,
        animation: show ? 'slideInRight 0.3s ease' : 'slideOutRight 0.3s ease forwards',
      }}
    >
      {isError ? (
        <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />
      ) : (
        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#1BBFB3' }} />
      )}
      <span className="text-sm font-medium" style={{ color: '#343A40' }}>
        {message}
      </span>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
