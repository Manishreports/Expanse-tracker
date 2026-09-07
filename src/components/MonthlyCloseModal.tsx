import React from 'react';
import {
  Award,
  Calendar,
  Check,
  ChevronRight,
  Flame,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { formatHumanDate, formatINR } from '../lib/calculations';
import { BudgetProfile, ExpenseItem } from '../types';

interface MonthlyCloseModalProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  onDismiss: () => void;
  onApplyRecommendedBudget: (newBudget: number) => void;
}

export const MonthlyCloseModal: React.FC<MonthlyCloseModalProps> = ({
  profile,
  expenses,
  onDismiss,
  onApplyRecommendedBudget,
}) => {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSaved = Math.max(0, profile.monthlyIncome - totalSpent);

  // Group by category
  const catSpending: Record<string, number> = {};
  expenses.forEach((e) => {
    catSpending[e.category] = (catSpending[e.category] || 0) + e.amount;
  });

  // Biggest single expense
  const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
  const biggestExpense = sortedExpenses[0];

  // Best controlled & Overspent
  let bestControlled = 'Grocery';
  let mostOverspent = 'Dining Out / Food Delivery';
  let maxOver = -999999;
  let maxUnder = -999999;

  profile.envelopes.forEach((env) => {
    const spent = catSpending[env.category] || 0;
    const diff = env.allocated - spent;
    if (diff > maxUnder) {
      maxUnder = diff;
      bestControlled = env.category;
    }
    const over = spent - env.allocated;
    if (over > maxOver) {
      maxOver = over;
      mostOverspent = env.category;
    }
  });

  const potentialNextMonthSavings = Math.round(totalSpent * 0.12);
  const recommendedNextBudget = Math.round(profile.monthlyBudget * 0.95);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 block">
                Month-End Financial Audit
              </span>
              <h2 className="text-xl font-black text-white">September 2026 Close</h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800">
          {/* Key Figures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 font-semibold block">Total Income</span>
              <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                {formatINR(profile.monthlyIncome)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 font-semibold block">Budget Cap</span>
              <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                {formatINR(profile.monthlyBudget)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 font-semibold block">Total Spent</span>
              <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                {formatINR(totalSpent)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-700 font-semibold block">Total Saved</span>
              <span className="text-base font-extrabold text-emerald-950 block mt-0.5">
                {formatINR(totalSaved)}
              </span>
            </div>
          </div>

          {/* Diagnostic breakdown */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-900">Best Controlled Category:</span>
              </div>
              <span className="font-bold text-emerald-950">{bestControlled}</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                <span className="font-semibold text-rose-900">Highest Strain Category:</span>
              </div>
              <span className="font-bold text-rose-950">{mostOverspent}</span>
            </div>

            {biggestExpense && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Biggest Single Expense:</span>
                  <span className="font-bold text-slate-800">{biggestExpense.description}</span>
                </div>
                <span className="font-extrabold text-slate-900">{formatINR(biggestExpense.amount)}</span>
              </div>
            )}
          </div>

          {/* AI Recommended Next Month Budget */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-xl border border-indigo-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Recommended Next Month Budget</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Based on your habits, you have a potential saving of{' '}
              <strong className="text-emerald-700">{formatINR(potentialNextMonthSavings)}</strong> by cutting
              discretionary spending. We recommend setting October's budget to{' '}
              <strong className="text-slate-900">{formatINR(recommendedNextBudget)}</strong>.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close Summary
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyRecommendedBudget(recommendedNextBudget);
                alert(`Updated budget to ${formatINR(recommendedNextBudget)}!`);
                onDismiss();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Adopt Recommended Budget ({formatINR(recommendedNextBudget)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
