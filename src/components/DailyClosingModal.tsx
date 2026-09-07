import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { DailyRecordStatus, ExpenseCategory, ExpenseItem, ExpenseNature } from '../types';
import { formatINR } from '../lib/calculations';

interface DailyClosingModalProps {
  currentDate: string; // The specific date being closed (YYYY-MM-DD)
  dayIndex: number;
  totalMissingDays: number;
  onSaveDay: (
    date: string,
    status: DailyRecordStatus,
    totalAmount: number,
    expenses: Omit<ExpenseItem, 'id' | 'createdAt'>[]
  ) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Grocery',
  'Food / Restaurant',
  'Fuel',
  'Fruits & Veg',
  'Milk & Dairy',
  'Household / Cleaning',
  'Mobile Recharge',
  'Medical / Healthcare',
  'Shopping',
  'Entertainment',
  'Other',
];

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  currentDate,
  dayIndex,
  totalMissingDays,
  onSaveDay,
}) => {
  const [declaredTotalStr, setDeclaredTotalStr] = useState<string>('');
  const [showZeroConfirm, setShowZeroConfirm] = useState<boolean>(false);

  interface DraftItem {
    category: ExpenseCategory;
    amount: string;
    description: string;
    nature: ExpenseNature;
  }

  const [items, setItems] = useState<DraftItem[]>([
    { category: 'Grocery', amount: '', description: '', nature: 'Essential' },
  ]);

  const [notes, setNotes] = useState<string>('');

  const declaredTotal = parseFloat(declaredTotalStr);
  const isDeclaredValid = !isNaN(declaredTotal) && declaredTotal >= 0;

  const itemsSum = items.reduce((sum, item) => {
    const amt = parseFloat(item.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const diff = isDeclaredValid ? Math.round(declaredTotal - itemsSum) : 0;
  const isBalanced = isDeclaredValid && Math.abs(declaredTotal - itemsSum) <= 0.01;

  const handleAddItem = () => {
    setItems([
      ...items,
      { category: 'Grocery', amount: '', description: '', nature: 'Variable' },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleItemChange = (idx: number, field: keyof DraftItem, val: string) => {
    setItems(
      items.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  // Format date readable
  const [y, m, d] = currentDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d, 12, 0, 0);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (declaredTotalStr.trim() === '' || isNaN(declaredTotal)) {
      return; // Block empty or NaN
    }

    if (declaredTotal === 0) {
      setShowZeroConfirm(true);
      return;
    }

    if (!isBalanced) {
      return;
    }

    const cleanedExpenses: Omit<ExpenseItem, 'id' | 'createdAt'>[] = items
      .filter((it) => parseFloat(it.amount) > 0)
      .map((it) => ({
        date: currentDate,
        category: it.category,
        amount: parseFloat(it.amount),
        description: it.description.trim() || `${it.category} expense`,
        nature: it.nature,
      }));

    onSaveDay(currentDate, 'RECORDED', declaredTotal, cleanedExpenses);
  };

  const handleConfirmZero = () => {
    onSaveDay(currentDate, 'ZERO_CONFIRMED', 0, []);
    setShowZeroConfirm(false);
  };

  return (
    <div
      id="daily-closing-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="daily-closing-card"
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              Gatekeeper: Daily Expense Closing
            </span>
            <span className="text-xs text-emerald-100 font-medium">
              Step {dayIndex} of {totalMissingDays}
            </span>
          </div>

          <h2 className="text-2xl font-bold mt-3 tracking-tight">
            Close Day: {formattedDate}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            Please account for all transactions for this date. Until all past dates are reconciled chronologically, app navigation is locked.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Total Amount for the Day */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Total Day Expense (इस दिन का कुल खर्च)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                ₹
              </span>
              <input
                id="input-declared-total"
                type="number"
                min="0"
                step="any"
                placeholder="Enter total (0 if no expense)"
                value={declaredTotalStr}
                onChange={(e) => {
                  setDeclaredTotalStr(e.target.value);
                  setShowZeroConfirm(false);
                }}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base font-semibold text-slate-800"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              If you spent nothing on this day, enter <strong className="text-slate-700 font-semibold">0</strong>. You will be asked for a one-click confirmation.
            </p>
          </div>

          {/* Zero Confirmation Banner */}
          {showZeroConfirm && (
            <div
              id="zero-confirm-banner"
              className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3"
            >
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Confirm ₹0 Spent (शून्य खर्च की पुष्टि)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    क्या आप confirm करते हैं कि <strong className="font-semibold">{formattedDate}</strong> को आपका कुल खर्च ₹0 था?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id="btn-confirm-zero"
                  onClick={handleConfirmZero}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Yes, Confirm ₹0 Spent
                </button>
                <button
                  type="button"
                  onClick={() => setShowZeroConfirm(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-amber-100/60 text-xs font-medium transition"
                >
                  Cancel / Re-enter
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Category Itemization (Only if declaredTotal > 0) */}
          {isDeclaredValid && declaredTotal > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Categorize Expenses (श्रेणी अनुसार विवरण)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Items must reconcile to match your declared total of{' '}
                    <strong className="text-slate-800">{formatINR(declaredTotal)}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-add-item-row"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="sm:col-span-4">
                      <select
                        value={item.category}
                        onChange={(e) =>
                          handleItemChange(idx, 'category', e.target.value)
                        }
                        className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3 relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemChange(idx, 'amount', e.target.value)
                        }
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Note / Description (optional)"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(idx, 'description', e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-400 hover:text-red-600 disabled:opacity-30 p-1"
                        title="Delete category row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reconciliation Status Bar */}
              <div
                id="reconciliation-status"
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  isBalanced
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span className="font-semibold">
                    Categorized: {formatINR(itemsSum)} / Declared: {formatINR(declaredTotal)}
                  </span>
                </div>
                <div>
                  {isBalanced ? (
                    <span className="font-bold text-emerald-700">Balanced ✓</span>
                  ) : (
                    <span className="font-bold text-rose-700">
                      Difference: {diff > 0 ? `+${formatINR(diff)}` : formatINR(diff)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Chronological check prevents untracked leaks.
            </span>
            <div className="flex items-center gap-2">
              {declaredTotal === 0 && (
                <button
                  type="button"
                  id="btn-trigger-zero-prompt"
                  onClick={() => setShowZeroConfirm(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition"
                >
                  Close with ₹0
                </button>
              )}

              {declaredTotal > 0 && (
                <button
                  type="submit"
                  id="btn-submit-day"
                  disabled={!isBalanced}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Reconcile & Next Day</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
