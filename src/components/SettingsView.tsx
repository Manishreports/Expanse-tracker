import React, { useState } from 'react';
import { Settings, RefreshCw, AlertTriangle, Save, User, Wallet } from 'lucide-react';
import { BudgetProfile, CategoryBudget } from '../types';
import { formatINR } from '../lib/calculations';

interface SettingsViewProps {
  profile: BudgetProfile;
  onUpdateProfile: (profile: BudgetProfile) => void;
  onResetData: () => void;
  onSimulateMissingDays: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
  onSimulateMissingDays,
}) => {
  const [formData, setFormData] = useState<BudgetProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCategoryChange = (idx: number, amount: number) => {
    const updated = formData.categoryBudgets.map((cat, i) =>
      i === idx ? { ...cat, allocatedAmount: amount } : cat
    );
    setFormData({ ...formData, categoryBudgets: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>App Configuration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Budget Profile & Household Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure income anchors, envelope limits, and test validation gates.
          </p>
        </div>

        {saveSuccess && (
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg animate-fade-in">
            Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Profile & Location</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">User Name</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Tracking Start Date</label>
              <input
                type="date"
                value={formData.trackingStartDate}
                onChange={(e) => setFormData({ ...formData, trackingStartDate: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        {/* Financial Targets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>Monthly Financial Targets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Monthly Income (₹)</label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) || 0 })
                }
                className="mt-1 w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Total Budget (₹)</label>
              <input
                type="number"
                value={formData.totalMonthlyBudget}
                onChange={(e) =>
                  setFormData({ ...formData, totalMonthlyBudget: parseFloat(e.target.value) || 0 })
                }
                className="mt-1 w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Savings Target (₹)</label>
              <input
                type="number"
                value={formData.savingsTarget}
                onChange={(e) =>
                  setFormData({ ...formData, savingsTarget: parseFloat(e.target.value) || 0 })
                }
                className="mt-1 w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        {/* Category Envelope Allocation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            Category Envelope Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {formData.categoryBudgets.map((cat, idx) => (
              <div key={cat.category} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-800 block">{cat.category}</span>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={cat.allocatedAmount}
                    onChange={(e) => handleCategoryChange(idx, parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>

      {/* Developer & Test Simulation Actions */}
      <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Testing & State Verification
        </h4>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSimulateMissingDays}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Simulate Missing Days (Sept 4 & 5)
          </button>
          <button
            type="button"
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};
