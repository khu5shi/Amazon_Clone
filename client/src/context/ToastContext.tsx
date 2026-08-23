'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id, type, title, message, duration };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast Notification Overlay Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-fade-in ${
              t.type === 'success'
                ? 'bg-white/95 dark:bg-[#131926]/95 border-green-500/40 text-gray-900 dark:text-white'
                : t.type === 'error'
                ? 'bg-white/95 dark:bg-[#131926]/95 border-red-500/40 text-gray-900 dark:text-white'
                : t.type === 'warning'
                ? 'bg-white/95 dark:bg-[#131926]/95 border-amber-500/40 text-gray-900 dark:text-white'
                : 'bg-white/95 dark:bg-[#131926]/95 border-blue-500/40 text-gray-900 dark:text-white'
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            </div>

            {/* Message */}
            <div className="flex-1 space-y-0.5 text-xs">
              <h5 className="font-bold leading-tight">{t.title}</h5>
              {t.message && (
                <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-snug">{t.message}</p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
