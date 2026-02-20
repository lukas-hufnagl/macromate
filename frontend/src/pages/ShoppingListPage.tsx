/**
 * MacroMate – Shopping List Page
 * Einkaufsliste mit Export (PDF/CSV) und smarten Einheiten.
 */

import { useState } from 'react';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { useI18nStore } from '../stores/i18nStore';
import {
  ShoppingCart,
  Search,
  Loader2,
  CheckCircle2,
  Circle,
  Package,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/** Smart-Unit Formatierung: 3 Stück Eier statt 3 g Eier */
function formatUnit(quantity: number, unit: string): string {
  const smartUnits: Record<string, string> = {
    'stück': 'Stk',
    'stk': 'Stk',
    'el': 'EL',
    'tl': 'TL',
    'prise': 'Prise(n)',
    'scheibe': 'Scheibe(n)',
    'tasse': 'Tasse(n)',
    'bund': 'Bund',
    'dose': 'Dose(n)',
    'packung': 'Pkg',
    'pkg': 'Pkg',
  };
  const lower = unit.toLowerCase();
  const display = smartUnits[lower] || unit;
  return `${quantity % 1 === 0 ? quantity : quantity.toFixed(1)} ${display}`;
}

export default function ShoppingListPage() {
  const { shoppingList, isLoading, fetchShoppingList } = useMealPlanStore();
  const t = useI18nStore((s) => s.t);

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleGenerate = async () => {
    try {
      await fetchShoppingList(startDate, endDate);
      setCheckedItems(new Set());
      toast.success('Einkaufsliste erstellt! 🛒');
    } catch {
      toast.error(t('general.error'));
    }
  };

  const toggleItem = (name: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // ── Export als CSV ──
  const exportCSV = () => {
    if (!shoppingList) return;
    const header = 'Zutat,Menge,Einheit,Erledigt\n';
    const rows = shoppingList.items.map((item) =>
      `"${item.name}",${item.total_quantity},"${item.unit}",${checkedItems.has(item.name) ? 'Ja' : 'Nein'}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `einkaufsliste_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('shoppingList.exportCSV') + ' ✓');
    setShowExportMenu(false);
  };

  // ── Export als PDF (druckfähiges HTML) ──
  const exportPDF = () => {
    if (!shoppingList) return;
    const html = `
      <html><head><title>MacroMate Einkaufsliste</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; }
        h1 { color: #18b363; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px 15px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f8f8; font-weight: 600; }
        .checked { text-decoration: line-through; color: #999; }
        .footer { margin-top: 30px; color: #999; font-size: 12px; }
      </style></head><body>
      <h1>🛒 MacroMate Einkaufsliste</h1>
      <p>${startDate} bis ${endDate}</p>
      <table>
        <tr><th>☐</th><th>Zutat</th><th>Menge</th></tr>
        ${shoppingList.items.map((item) => {
          const checked = checkedItems.has(item.name);
          return `<tr class="${checked ? 'checked' : ''}">
            <td>${checked ? '☑' : '☐'}</td>
            <td>${item.name}</td>
            <td>${formatUnit(item.total_quantity, item.unit)}</td>
          </tr>`;
        }).join('')}
      </table>
      <p class="footer">Generiert von MacroMate – Smart Meal Prep Planner</p>
      </body></html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
    toast.success(t('shoppingList.exportPDF') + ' ✓');
    setShowExportMenu(false);
  };

  const checkedCount = checkedItems.size;
  const totalCount = shoppingList?.items.length || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ShoppingCart size={28} className="text-accent-400" />
          {t('shoppingList.title')}
        </h1>
        <p className="text-gray-500 dark:text-dark-400 mt-1">
          {t('shoppingList.title')}
        </p>
      </div>

      {/* Date Range */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('mealPlanner.dateRange')}</h3>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="input-label">{t('general.from')}</label>
            <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex-1 w-full">
            <label className="input-label">{t('general.to')}</label>
            <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button onClick={handleGenerate} disabled={isLoading} className="btn-primary whitespace-nowrap">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {t('shoppingList.title')}
          </button>
        </div>
      </div>

      {/* Shopping List */}
      {shoppingList && (
        <div className="glass-card overflow-hidden animate-slide-up">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-dark-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t('shoppingList.title')}</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  {totalCount} Zutaten · {checkedCount} erledigt
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Progress */}
                {totalCount > 0 && (
                  <div className="flex items-center gap-2 flex-1 sm:flex-none">
                    <div className="h-2 w-24 sm:w-32 bg-gray-200 dark:bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-500"
                        style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-dark-400">
                      {Math.round((checkedCount / totalCount) * 100)}%
                    </span>
                  </div>
                )}

                {/* Export Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="btn-secondary text-sm"
                  >
                    <Download size={16} />
                    {t('shoppingList.export')}
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 shadow-xl z-10 overflow-hidden animate-slide-up">
                      <button
                        onClick={exportPDF}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                      >
                        <FileText size={16} className="text-red-500" />
                        {t('shoppingList.exportPDF')}
                      </button>
                      <button
                        onClick={exportCSV}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                      >
                        <FileSpreadsheet size={16} className="text-green-500" />
                        {t('shoppingList.exportCSV')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-100 dark:divide-dark-800/30">
            {shoppingList.items.length > 0 ? (
              shoppingList.items.map((item) => {
                const isChecked = checkedItems.has(item.name);
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item.name)}
                    className={clsx(
                      'w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 text-left transition-all',
                      'hover:bg-gray-50 dark:hover:bg-dark-900/30',
                      isChecked && 'opacity-50'
                    )}
                  >
                    {isChecked ? (
                      <CheckCircle2 size={20} className="text-accent-400 flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-gray-300 dark:text-dark-600 flex-shrink-0" />
                    )}
                    <span className={clsx(
                      'flex-1 font-medium transition-all',
                      isChecked ? 'line-through text-gray-400 dark:text-dark-500' : 'text-gray-900 dark:text-white'
                    )}>
                      {item.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-dark-400 tabular-nums">
                      {formatUnit(item.total_quantity, item.unit)}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <Package size={32} className="text-gray-300 dark:text-dark-600 mx-auto mb-3" />
                <p className="text-gray-400 dark:text-dark-500">{t('shoppingList.empty')}</p>
              </div>
            )}
          </div>

          {/* All Done */}
          {totalCount > 0 && checkedCount === totalCount && (
            <div className="p-4 bg-accent/5 text-center">
              <p className="text-accent font-medium">{t('shoppingList.allDone')}</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!shoppingList && (
        <div className="glass-card p-8 sm:p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-800/50 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={28} className="text-gray-400 dark:text-dark-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-dark-300 mb-2">
            {t('shoppingList.empty')}
          </h3>
          <p className="text-gray-400 dark:text-dark-500 max-w-md mx-auto">
            Wähle einen Zeitraum und erstelle eine Einkaufsliste.
          </p>
        </div>
      )}
    </div>
  );
}
