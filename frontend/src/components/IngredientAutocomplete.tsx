/**
 * MacroMate – IngredientAutocomplete Component
 * Typeahead search with nutrition preview. Keyboard navigable, mobile-friendly.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Database, Loader2, PenLine } from 'lucide-react';
import { ingredientsAPI } from '../services/api';
import { useI18nStore } from '../stores/i18nStore';
import type { IngredientSuggestion } from '../types';
import clsx from 'clsx';

interface Props {
  value: string;
  onChange: (name: string) => void;
  onSelect?: (suggestion: IngredientSuggestion) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export default function IngredientAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  compact,
}: Props) {
  const locale = useI18nStore((s) => s.locale);
  const t = useI18nStore((s) => s.t);
  const [suggestions, setSuggestions] = useState<IngredientSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  const searchIngredients = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (query.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await ingredientsAPI.search(query, locale);
          setSuggestions(results);
          setIsOpen(true);
          setHighlightIndex(-1);
        } catch (err) {
          console.error('Ingredient search error:', err);
          setSuggestions([]);
          setIsOpen(true); // still open so "not found" shows
        } finally {
          setIsLoading(false);
        }
      }, 250);
    },
    [locale],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    searchIngredients(val);
  };

  const handleSelect = (suggestion: IngredientSuggestion) => {
    onChange(suggestion.name);
    setSuggestions([]);
    setIsOpen(false);
    onSelect?.(suggestion);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
          handleSelect(suggestions[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && dropdownRef.current) {
      const el = dropdownRef.current.children[highlightIndex + 1] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={clsx(
            'input pr-9 text-sm',
            compact && 'py-2 px-3',
            className,
          )}
          placeholder={placeholder || t('general.searchIngredient')}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          autoComplete="off"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 size={14} className="animate-spin text-accent-400" />
          ) : (
            <Search size={14} className="text-gray-400 dark:text-dark-500" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-[60] top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto
                     rounded-2xl bg-white dark:bg-dark-850 
                     border border-gray-200/80 dark:border-dark-700/60 
                     shadow-2xl shadow-black/10 dark:shadow-black/40
                     ring-1 ring-black/5 dark:ring-white/5
                     animate-fade-in backdrop-blur-sm"
        >
          {suggestions.length > 0 ? (
            <>
              {/* Header */}
              <div className="sticky top-0 px-3 py-2 bg-gray-50/90 dark:bg-dark-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-dark-800/50">
                <p className="text-[10px] font-medium text-gray-400 dark:text-dark-500 uppercase tracking-wider">
                  {suggestions.length} {t('general.results')} — {t('general.per100g')}
                </p>
              </div>

              {suggestions.map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              type="button"
              className={clsx(
                'w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-all duration-150',
                'border-b border-gray-50 dark:border-dark-800/30 last:border-0',
                i === highlightIndex
                  ? 'bg-accent-50/80 dark:bg-accent-500/10'
                  : 'hover:bg-gray-50/80 dark:hover:bg-dark-800/40',
              )}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-accent-100 dark:bg-accent-500/15"
              >
                <Database size={13} className="text-accent-600 dark:text-accent-400" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Name */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {s.name}
                  </span>
                  {s.brand && (
                    <span className="text-[10px] text-gray-400 dark:text-dark-500 truncate hidden sm:inline">
                      · {s.brand}
                    </span>
                  )}
                </div>

                {/* Nutrition bar */}
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] font-bold text-fire-400">
                    {Math.round(s.calories_100g)} kcal
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-dark-400">
                    <span>
                      <span className="text-blue-400 font-semibold">P</span>{' '}
                      {Math.round(s.protein_100g * 10) / 10}g
                    </span>
                    <span>
                      <span className="text-yellow-400 font-semibold">F</span>{' '}
                      {Math.round(s.fat_100g * 10) / 10}g
                    </span>
                    <span>
                      <span className="text-purple-400 font-semibold">C</span>{' '}
                      {Math.round(s.carbs_100g * 10) / 10}g
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
            </>
          ) : (
            /* No results – manual entry fallback */
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-dark-400 mb-3">
                {t('general.notFound')}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-accent-500/10 text-accent-600 dark:text-accent-400 hover:bg-accent-500/20 transition-colors"
                onClick={() => {
                  const manual: IngredientSuggestion = {
                    name: value.trim(),
                    calories_100g: 0,
                    protein_100g: 0,
                    fat_100g: 0,
                    carbs_100g: 0,
                    source: 'manual',
                  };
                  handleSelect(manual);
                }}
              >
                <PenLine size={14} />
                {t('general.manualEntry')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
