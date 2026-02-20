/**
 * ConfirmDialog – Schöner zentrierter Bestätigungs-Dialog
 * Ersetzt den hässlichen browser-nativen confirm()
 */
import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useI18nStore } from '../stores/i18nStore';
import clsx from 'clsx';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: ReactNode;
}

interface ConfirmContextType {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
});

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);
  const t = useI18nStore((s) => s.t);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    resolver?.(true);
    setOpen(false);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    setOpen(false);
    setResolver(null);
  };

  const variant = options.variant || 'danger';

  const variantClasses = {
    danger: 'from-red-500/20 to-red-600/10 border-red-500/30',
    warning: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    info: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  };

  const btnClasses = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  };

  const iconColors = {
    danger: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <div
            className={clsx(
              'relative w-full max-w-md rounded-2xl border bg-gradient-to-b p-6 shadow-2xl animate-slide-up',
              'bg-white dark:bg-dark-800',
              'border-gray-200 dark:border-dark-600',
              'dark:' + variantClasses[variant]
            )}
          >
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:text-dark-400 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={clsx(
                'rounded-full p-3',
                'bg-gray-100 dark:bg-dark-700/50',
                iconColors[variant]
              )}>
                {options.icon || <AlertTriangle size={32} />}
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {options.title || t('confirm.delete')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-300">
                {options.message || t('confirm.deleteMessage')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className={clsx(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                  'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  'dark:bg-dark-700 dark:text-dark-200 dark:hover:bg-dark-600'
                )}
              >
                {options.cancelText || t('confirm.cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className={clsx(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-800',
                  btnClasses[variant]
                )}
              >
                {options.confirmText || t('confirm.yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
