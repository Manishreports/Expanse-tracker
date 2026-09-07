import React from 'react';
import {
  Wallet,
  TrendingDown,
  Calendar,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  PieChart as PieIcon,
  ArrowUpRight,
} from 'lucide-react';
import { BudgetProfile, DailyRecord, ExpenseItem } from '../types';
import { calculateDashboardSummary, formatINR } from '../lib/calculations';

interface DashboardViewProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  dailyRecords: DailyRecord[];
  todayDate: string;
  onOpenQuickAdd: () => void;
  onOpenCloseToday: () => void;
  onNavigateToExpenses: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  expenses,
  dailyRecords,
  todayDate,
  onOpenQuickAdd,
  onOpenCloseToday,
  onNavigateToExpenses,
}) => {
  const summary = calculateDashboardSummary(
    profile,
    expenses,
    [],
    dailyRecords,
    todayDate
  );

  const todayRecord = dailyRecords.find((r) => r.date === todayDate);
  const isTodayClosed =
    todayRecord && (todayRecord.status === 'RECORDED' || todayRecord.status === 'ZERO_CONFIRMED');

  // Category spending calculations
  const [year, month] = todayDate.split('-').map(Number);
  const currentMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));

  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const recentExpenses = [...monthExpenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold border border-emerald-500/30">
            <span>Namaste, {profile.userName}</span>
            <span>•</span>
            <span>{profile.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            September 2026 Household Budget
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
            All historical days are reconciled. Track today's transactions and keep your burn rate within the recommended limit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onOpenCloseToday}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
              isTodayClosed
                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600/40'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isTodayClosed ? "Today Closed ✓" : "Close Today's Day"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {formatINR(summary.totalSpent)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            of {formatINR(summary.totalMonthlyBudget)} allocated budget
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                summary.burnRatePercentage > 100
                  ? 'bg-rose-600'
                  : summary.burnRatePercentage > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, summary.burnRatePercentage)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Remaining Money */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Remaining Money</span>
            <TrendingDown className="w-4 h-4 text-teal-600" />
          </div>
          <div
            className={`text-2xl font-extrabold mt-2 ${
              summary.remainingMoney < 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {formatINR(summary.remainingMoney)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {summary.daysRemaining} days remaining in September
          </div>
        </div>

        {/* Card 3: Today's Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Spend</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {formatINR(summary.todaySpent)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Week to date: {formatINR(summary.weekSpent)}
          </div>
        </div>

        {/* Card 4: Daily Recommended */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Recommended</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">
            {formatINR(summary.dailyRecommended)}
            <span className="text-xs font-normal text-slate-500"> / day</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Safe pace to prevent budget overage
          </div>
        </div>
      </div>

      {/* Main Grid: Envelopes & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Envelope Allocations */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Category Envelopes & Utilization
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {profile.categoryBudgets.map((cat) => {
              const spent = categoryTotals[cat.category] || 0;
              const pct = Math.round((spent / (cat.allocatedAmount || 1)) * 100);

              return (
                <div
                  key={cat.category}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {cat.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {formatINR(spent)} / {formatINR(cat.allocatedAmount)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct > 100
                          ? 'bg-rose-600'
                          : pct > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{cat.nature}</span>
                    <span className={pct > 100 ? 'text-rose-600 font-bold' : ''}>
                      {pct}% used
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
            <button
              onClick={onNavigateToExpenses}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No transactions recorded yet.
              </p>
            ) : (
              recentExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
                >
                  <div className="overflow-hidden pr-2">
                    <span className="font-bold text-slate-900 block truncate">
                      {exp.category}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {exp.description} • {exp.date}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatINR(exp.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
