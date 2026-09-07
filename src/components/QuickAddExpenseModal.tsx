import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { ExpenseCategory, ExpenseItem, ExpenseNature } from '../types';
import { smartCategorize } from '../lib/calculations';

interface QuickAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  defaultDate: string;
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

export const QuickAddExpenseModal: React.FC<QuickAddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  defaultDate,
}) => {
  const [date, setDate] = useState(defaultDate);
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Grocery');
  const [nature, setNature] = useState<ExpenseNature>('Variable');
  const [autoSuggested, setAutoSuggested] = useState(false);

  if (!isOpen) return null;

  const handleDescChange = (text: string) => {
    setDescription(text);
    if (text.length > 2) {
      const detected = smartCategorize(text);
      setCategory(detected.category);
      setNature(detected.nature);
      setAutoSuggested(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    onAddExpense({
      date,
      amount,
      category,
      description: description.trim() || `${category} expense`,
      nature,
    });

    setAmountStr('');
    setDescription('');
    onClose();
  };

  return (
    <div
      id="quick-add-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Quick Add Expense</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Amount (₹)</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Description / Note
              </label>
              {autoSuggested && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <Sparkles className="w-3 h-3" /> Auto-categorized
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Sabzi, Milk, Petrol, Swiggy..."
              value={description}
              onChange={(e) => handleDescChange(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="mt-1 w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Nature</label>
              <select
                value={nature}
                onChange={(e) => setNature(e.target.value as ExpenseNature)}
                className="mt-1 w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Essential">Essential (ज़रूरी)</option>
                <option value="Variable">Variable (घट-बढ़)</option>
                <option value="Optional">Optional (वैकल्पिक)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
