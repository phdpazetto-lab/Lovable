import { X } from 'lucide-react';
import type { ToastMessage } from '../hooks/useToast';

interface ToastProps {
  toast: ToastMessage | null;
  onClose?: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  const type = toast.type || 'info';
  const bgColor =
    type === 'success'
      ? 'bg-green-50 text-green-800 border-green-200'
      : type === 'error'
        ? 'bg-red-50 text-red-800 border-red-200'
        : 'bg-blue-50 text-blue-800 border-blue-200';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all">
      <div className={`${bgColor} flex-1 rounded-md p-3 shadow-inner`}>
        {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
        <p className="text-sm leading-relaxed">{toast.message}</p>
      </div>
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="text-gray-500 transition hover:text-gray-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}
