/**
 * MacroMate – CustomSelect Component
 * Spotify-style custom dropdown replacing native <select>.
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function CustomSelect({ options, value, onChange, placeholder, className, size = 'md' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between gap-2',
          'bg-white dark:bg-dark-850 border border-gray-200 dark:border-dark-700',
          'rounded-xl text-gray-900 dark:text-dark-100',
          'transition-all duration-150',
          'focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15',
          'hover:border-gray-300 dark:hover:border-dark-600',
          isOpen && 'border-accent-500 ring-2 ring-accent-500/15',
          size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm',
        )}
      >
        <span className={clsx(!selectedOption && 'text-gray-400 dark:text-dark-500')}>
          {selectedOption?.label || placeholder || 'Auswählen...'}
        </span>
        <ChevronDown
          size={16}
          className={clsx(
            'text-gray-400 dark:text-dark-500 transition-transform duration-200 flex-shrink-0',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[60] top-full left-0 right-0 mt-1.5 overflow-hidden rounded-xl bg-white dark:bg-dark-850 border border-gray-200/80 dark:border-dark-700/60 shadow-2xl shadow-black/10 dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/5 animate-fade-in">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-all duration-100',
                    isSelected
                      ? 'bg-accent-50/80 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 font-medium'
                      : 'text-gray-700 dark:text-dark-200 hover:bg-gray-50 dark:hover:bg-dark-800/60',
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={15} className="text-accent-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
