import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  Calendar,
  CheckCircle2,
  DollarSign,
  Plus,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { formatHumanDate, formatINR, simulateWhatIfScenario } from '../lib/calculations';
import { BudgetProfile, ExpenseItem, SavingGoal, WhatIfScenario } from '../types';

interface WhatIfAndGoalsViewProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  goals: SavingGoal[];
  onAddGoal: (goal: Omit<SavingGoal, 'id'>) => void;
  onUpdateGoalProgress: (id: string, newSaved: number) => void;
}

export const WhatIfAndGoalsView: React.FC<WhatIfAndGoalsViewProps> = ({
  profile,
  expenses,
  goals,
  onAddGoal,
  onUpdateGoalProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'whatif' | 'goals'>('whatif');

  // Simulator state
  const [monthlyIncomeMod, setMonthlyIncomeMod] = useState<number>(0);
  const [expenseMod, setExpenseMod] = useState<number>(0);
  const [oneTimeExpense, setOneTimeExpense] = useState<number>(0);
  const [categoryTarget, setCategoryTarget] = useState<string>('Dining Out / Food Delivery');

  // Goals modal/form
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');

  // Interactive scenario calculations
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const effectiveIncome = profile.monthlyIncome + monthlyIncomeMod;
  const netExpenseChange = expenseMod + oneTimeExpense;
  const projectedBudget = Math.max(0, profile.totalMonthlyBudget + netExpenseChange);
  const projectedMonthlySavings = Math.max(0, effectiveIncome - (totalSpent + netExpenseChange));
  const projectedDailyLimit = Math.max(0, Math.floor((projectedBudget - totalSpent) / 25));

  const feasibility: 'Safe' | 'Tight' | 'Critical' =
    projectedMonthlySavings >= profile.savingsTarget
      ? 'Safe'
      : projectedMonthlySavings > 1500
      ? 'Tight'
      : 'Critical';

  const explanation =
    oneTimeExpense > 0
      ? `A one-time expenditure of ${formatINR(oneTimeExpense)} temporarily narrows your liquidity. To avoid depleting your savings target of ${formatINR(profile.savingsTarget)}, consider trimming discretionary dining or entertainment over the next 2 months.`
      : expenseMod < 0
      ? `Trimming spending by ${formatINR(Math.abs(expenseMod))} yields ${formatINR(Math.abs(expenseMod) * 12)} in additional annual wealth! You will reach your target goals significantly faster.`
      : monthlyIncomeMod > 0
      ? `An extra ${formatINR(monthlyIncomeMod)}/month allows you to expand your emergency buffer while keeping discretionary spending well within disciplined boundaries.`
      : `Current baseline financial plan maintains healthy discipline. Adjust sliders or select presets to test future scenarios.`;

  const simulation = {
    feasibility,
    projectedMonthlySavings,
    projectedDailyLimit,
    explanation,
  };

  const handleApplyPreset = (type: string) => {
    if (type === 'save3000') {
      setMonthlyIncomeMod(0);
      setExpenseMod(-3000);
      setOneTimeExpense(0);
    } else if (type === 'salary5000') {
      setMonthlyIncomeMod(5000);
      setExpenseMod(0);
      setOneTimeExpense(0);
    } else if (type === 'buyPhone20000') {
      setMonthlyIncomeMod(0);
      setExpenseMod(0);
      setOneTimeExpense(20000);
    } else if (type === 'cutDining50') {
      setMonthlyIncomeMod(0);
      setExpenseMod(-1200);
      setOneTimeExpense(0);
    } else if (type === 'trip5000') {
      setMonthlyIncomeMod(0);
      setExpenseMod(0);
      setOneTimeExpense(5000);
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const saved = parseFloat(currentSaved) || 0;
    if (!goalName.trim() || isNaN(target) || target <= 0) return;

    // Monthly required calculation
    const monthsLeft = 4; // approximate
    const monthlyReq = Math.ceil((target - saved) / monthsLeft);

    onAddGoal({
      title: goalName.trim(),
      targetAmount: target,
      currentSavings: saved,
      currentSaved: saved,
      deadline,
      category: 'General',
      monthlyRequired: monthlyReq,
      priority: 'Medium',
    });

    setGoalName('');
    setTargetAmount('');
    setCurrentSaved('');
    setIsAddingGoal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            What-If Simulator &amp; Savings Goals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test financial decisions before committing money, and track milestone savings goals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('whatif')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'whatif'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            What-If Simulator
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'goals'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Saving Goals ({goals.length})
          </button>
        </div>
      </div>

      {/* TAB 1: WHAT-IF SIMULATOR */}
      {activeTab === 'whatif' && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Quick Decision Presets
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('save3000')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                + Increase Monthly Saving by ₹3,000
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('salary5000')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                + Salary Hike (+₹5,000/mo)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('buyPhone20000')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-800 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                ⚠️ Buy ₹20,000 Phone
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('cutDining50')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                🥗 Reduce Food Delivery by 50%
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('trip5000')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                ✈️ Weekend Trip (₹5,000)
              </button>
            </div>
          </div>

          {/* Controls & Immediate Impact Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Scenario Parameters
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Monthly Income Change (₹)</span>
                    <span className="font-bold text-emerald-700">
                      {monthlyIncomeMod >= 0 ? `+${formatINR(monthlyIncomeMod)}` : formatINR(monthlyIncomeMod)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10000"
                    max="20000"
                    step="1000"
                    value={monthlyIncomeMod}
                    onChange={(e) => setMonthlyIncomeMod(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Monthly Recurring Expense Change (₹)</span>
                    <span className="font-bold text-rose-700">
                      {expenseMod >= 0 ? `+${formatINR(expenseMod)}` : formatINR(expenseMod)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-8000"
                    max="10000"
                    step="500"
                    value={expenseMod}
                    onChange={(e) => setExpenseMod(parseInt(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>One-Time Purchase / Event (₹)</span>
                    <span className="font-bold text-slate-900">{formatINR(oneTimeExpense)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={oneTimeExpense}
                    onChange={(e) => setOneTimeExpense(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMonthlyIncomeMod(0);
                  setExpenseMod(0);
                  setOneTimeExpense(0);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline block pt-2"
              >
                Reset Scenario to Baseline
              </button>
            </div>

            {/* Simulated Outcomes */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase font-bold text-emerald-300">
                    Projected Scenario Impact
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      simulation.feasibility === 'Safe'
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                        : simulation.feasibility === 'Tight'
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                        : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                    }`}
                  >
                    Feasibility: {simulation.feasibility}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block">Projected Monthly Savings</span>
                    <span className="text-xl font-black text-white mt-0.5 block">
                      {formatINR(simulation.projectedMonthlySavings)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Target: {formatINR(profile.savingTarget)}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block">New Daily Spending Limit</span>
                    <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                      {formatINR(simulation.projectedDailyLimit)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Baseline: {formatINR(Math.round(profile.monthlyBudget / 30))}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 text-xs leading-relaxed text-slate-200">
                  <strong className="text-white block mb-1">Simulation Assessment:</strong>
                  {simulation.explanation}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-white/10">
                Calculated without altering your real transactions ledger.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAVING GOALS */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Priority Saving Goals</h2>
              <p className="text-xs text-slate-500">
                Automated tracking of target milestones based on current monthly savings rate
              </p>
            </div>
            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingGoal ? 'Cancel' : 'New Goal'}</span>
            </button>
          </div>

          {/* New Goal Form */}
          {isAddingGoal && (
            <form
              onSubmit={handleCreateGoal}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Create Milestone Goal
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Goal name (e.g. New Laptop)"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="number"
                  required
                  placeholder="Target Amount (₹)"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
                <input
                  type="number"
                  placeholder="Current Saved (₹)"
                  value={currentSaved}
                  onChange={(e) => setCurrentSaved(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow"
                >
                  Save Goal
                </button>
              </div>
            </form>
          )}

          {/* Goals List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {goals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100));
              const remaining = goal.targetAmount - goal.currentSaved;

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-extrabold text-slate-900 text-base">{goal.title}</h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        {goal.priority}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target Date: {formatHumanDate(goal.deadline)}</span>
                    </div>

                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Saved: {formatINR(goal.currentSaved)}</span>
                        <span className="text-slate-900 font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Remaining: {formatINR(remaining)}</span>
                        <span>Target: {formatINR(goal.targetAmount)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <span className="font-bold text-slate-800 block">Monthly Target Needed:</span>
                      ~{formatINR(goal.monthlyRequired)}/month to hit deadline.
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Quick Add Progress:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onUpdateGoalProgress(goal.id, goal.currentSaved + 1000)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        +₹1k
                      </button>
                      <button
                        onClick={() => onUpdateGoalProgress(goal.id, goal.currentSaved + 5000)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        +₹5k
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
