import React from 'react';
import { Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { BudgetProfile, ExpenseItem } from '../types';
import { formatINR } from '../lib/calculations';

interface BudgetEnvelopesViewProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  todayDate: string;
}

export const BudgetEnvelopesView: React.FC<BudgetEnvelopesViewProps> = ({
  profile,
  expenses,
  todayDate,
}) => {
  const [year, month] = todayDate.split('-').map(Number);
  const currentMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));

  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Zero-Based Envelope Method</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          Household Budget Envelopes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Every rupee has a defined job. When an envelope empties, discretionary spending stops.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profile.categoryBudgets.map((cat) => {
          const spent = categoryTotals[cat.category] || 0;
          const remaining = cat.allocatedAmount - spent;
          const pct = Math.round((spent / (cat.allocatedAmount || 1)) * 100);
          const isOver = remaining < 0;

          return (
            <div
              key={cat.category}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{cat.category}</h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      cat.nature === 'Essential'
                        ? 'bg-blue-50 text-blue-700'
                        : cat.nature === 'Variable'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {cat.nature}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Envelope</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatINR(cat.allocatedAmount)}
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isOver ? 'bg-rose-600' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Spent</span>
                  <span className="font-bold text-slate-800">{formatINR(spent)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">
                    {isOver ? 'Overspent' : 'Remaining'}
                  </span>
                  <span
                    className={`font-extrabold ${
                      isOver ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {isOver ? `-${formatINR(Math.abs(remaining))}` : formatINR(remaining)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
