import { createContext, useContext, useState, useEffect } from 'react';
import { Rocket, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      {children}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-float">
          <div className="galaxy-card px-6 py-4 rounded-2xl flex items-center gap-4 bg-[var(--color-bg-light)]/90 backdrop-blur-xl border border-[var(--color-primary-bright)]/50 shadow-[0_0_30px_rgba(0,243,255,0.3)]">
            <div className="p-2 bg-[var(--color-primary-bright)]/20 rounded-full">
              <Rocket className="w-5 h-5 text-[var(--color-primary-bright)] animate-pulse" />
            </div>
            <p className="text-[var(--color-text-dark)] font-bold tracking-wide uppercase text-sm">{toast}</p>
            <button 
              onClick={closeToast}
              className="ml-4 p-1 hover:bg-[var(--color-primary-muted)]/10 rounded-full transition-colors text-gray-600 hover:text-[var(--color-text-dark)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Neon Glow Trail Effect */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary-muted)] to-transparent blur-sm opacity-70"></div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
