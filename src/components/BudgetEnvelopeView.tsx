import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  DollarSign,
  Edit2,
  Layers,
  Save,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { formatINR } from '../lib/calculations';
import { BudgetEnvelope, BudgetProfile, ExpenseItem } from '../types';

interface BudgetEnvelopeViewProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  onUpdateProfile: (updated: Partial<BudgetProfile>) => void;
}

export const BudgetEnvelopeView: React.FC<BudgetEnvelopeViewProps> = ({
  profile,
  expenses,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [income, setIncome] = useState(profile.monthlyIncome);
  const [totalBudget, setTotalBudget] = useState(profile.monthlyBudget);
  const [savingTarget, setSavingTarget] = useState(profile.savingTarget);
  const [emergencyBuffer, setEmergencyBuffer] = useState(profile.emergencyBuffer);

  // Category envelope allocations
  const [envelopes, setEnvelopes] = useState<BudgetEnvelope[]>(profile.envelopes);

  const handleEnvelopeAllocChange = (category: string, amount: number) => {
    setEnvelopes((prev) =>
      prev.map((env) => (env.category === category ? { ...env, allocated: Math.max(0, amount) } : env))
    );
  };

  const totalAllocated = envelopes.reduce((s, e) => s + e.allocated, 0);
  const allocationDiff = totalBudget - totalAllocated;

  // Calculate actual spending per envelope
  const envelopeSpending = envelopes.map((env) => {
    const spent = expenses
      .filter((e) => e.category === env.category)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      ...env,
      spent,
      remaining: env.allocated - spent,
      percentUsed: env.allocated > 0 ? Math.round((spent / env.allocated) * 100) : 0,
    };
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      monthlyIncome: income,
      monthlyBudget: totalBudget,
      savingTarget,
      emergencyBuffer,
      envelopes,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Monthly Budget &amp; Envelope System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Divide your ₹25,000 budget into strict envelopes: Fixed Bills, Variable Groceries/Fuel, Optional Fun &amp; Emergency Buffer
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            isEditing
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow'
          }`}
        >
          {isEditing ? (
            <>Cancel Editing</>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Allocations</span>
            </>
          )}
        </button>
      </div>

      {/* Top Level Financial Setup */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Financial Foundation
        </h2>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Spending Cap (₹)
                </label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Saving Target (₹)
                </label>
                <input
                  type="number"
                  value={savingTarget}
                  onChange={(e) => setSavingTarget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Buffer (₹)
                </label>
                <input
                  type="number"
                  value={emergencyBuffer}
                  onChange={(e) => setEmergencyBuffer(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
                />
              </div>
            </div>

            {/* Validation alert */}
            {allocationDiff < 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Envelope allocations exceed total budget by {formatINR(Math.abs(allocationDiff))}! Please reduce some categories.
                </span>
              </div>
            )}

            {/* Envelope Allocations Table */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">
                  Category Envelope Allocations (Total: {formatINR(totalAllocated)} / {formatINR(totalBudget)})
                </span>
                <span
                  className={`text-xs font-bold ${
                    allocationDiff === 0
                      ? 'text-emerald-600'
                      : allocationDiff > 0
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {allocationDiff === 0
                    ? '100% Budget Distributed'
                    : allocationDiff > 0
                    ? `${formatINR(allocationDiff)} unallocated`
                    : `${formatINR(Math.abs(allocationDiff))} over-allocated`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {envelopes.map((env) => (
                  <div
                    key={env.category}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-xs text-slate-800 block">
                        {env.category}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {env.nature} Envelope
                      </span>
                    </div>
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        step="50"
                        min="0"
                        value={env.allocated}
                        onChange={(e) =>
                          handleEnvelopeAllocChange(env.category, parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-6 pr-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Budget Settings</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Monthly Income</span>
              <span className="text-xl font-extrabold text-slate-900 block mt-1">
                {formatINR(profile.monthlyIncome)}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Total Spending Cap</span>
              <span className="text-xl font-extrabold text-slate-900 block mt-1">
                {formatINR(profile.monthlyBudget)}
              </span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">Saving Target</span>
              <span className="text-xl font-extrabold text-emerald-950 block mt-1">
                {formatINR(profile.savingTarget)}
              </span>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-xs text-blue-800 font-semibold block">Emergency Buffer</span>
              <span className="text-xl font-extrabold text-blue-950 block mt-1">
                {formatINR(profile.emergencyBuffer)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ENVELOPE PERFORMANCE & TRACKING */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Envelope Spending Trackers</h2>
            <p className="text-xs text-slate-500">
              Check how much remains in each envelope before making your next purchase
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {envelopeSpending.length} Envelopes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {envelopeSpending.map((env) => {
            const isOver = env.remaining < 0;
            const isNear = env.percentUsed >= 80 && !isOver;

            return (
              <div
                key={env.category}
                className={`p-4 rounded-xl border transition ${
                  isOver
                    ? 'border-rose-300 bg-rose-50/40'
                    : isNear
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{env.category}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {env.nature} • Weekly target ~{formatINR(Math.round(env.allocated / 4))}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-extrabold block ${
                        isOver ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {formatINR(env.spent)} / {formatINR(env.allocated)}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        isOver
                          ? 'text-rose-600'
                          : isNear
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {isOver
                        ? `Over by ${formatINR(Math.abs(env.remaining))}`
                        : `${formatINR(env.remaining)} left`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, env.percentUsed)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
