import { useCallback, useEffect, useRef, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

export type ToastMessage = {
  title?: string;
  message: string;
  type?: ToastVariant;
};

export function useToast(timeout = 4000) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (payload: ToastMessage) => {
      clearToast();
      setToast(payload);
      timerRef.current = setTimeout(() => setToast(null), timeout);
    },
    [clearToast, timeout]
  );

  useEffect(() => clearToast, [clearToast]);

  return { toast, showToast, clearToast };
}
