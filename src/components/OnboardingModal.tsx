import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BudgetProfile, CategoryBudget, ExpenseCategory, ExpenseNature } from '../types';
import { formatINR } from '../lib/calculations';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: BudgetProfile) => void;
  todayDate: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  todayDate,
}) => {
  const [userName, setUserName] = useState('');
  const [incomeStr, setIncomeStr] = useState('35000');
  const [budgetStr, setBudgetStr] = useState('28000');
  const [savingsTargetStr, setSavingsTargetStr] = useState('7000');
  const [emergencyBufferStr, setEmergencyBufferStr] = useState('1000');
  const [city, setCity] = useState('Raipur');
  const [familySize, setFamilySize] = useState(3);
  const [foodPreference, setFoodPreference] = useState<'Veg' | 'Non-Veg' | 'Eggetarian'>('Veg');
  const [startDate, setStartDate] = useState(todayDate);

  if (!isOpen) return null;

  const income = parseFloat(incomeStr) || 0;
  const budget = parseFloat(budgetStr) || 0;
  const savings = parseFloat(savingsTargetStr) || 0;
  const buffer = parseFloat(emergencyBufferStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Default envelopes proportional to budget
    const defaultEnvelopes: CategoryBudget[] = [
      { category: 'Grocery', allocatedAmount: Math.round(budget * 0.20), nature: 'Essential' },
      { category: 'Milk & Dairy', allocatedAmount: Math.round(budget * 0.08), nature: 'Essential' },
      { category: 'Fruits & Veg', allocatedAmount: Math.round(budget * 0.08), nature: 'Variable' },
      { category: 'Fuel', allocatedAmount: Math.round(budget * 0.12), nature: 'Variable' },
      { category: 'Food / Restaurant', allocatedAmount: Math.round(budget * 0.10), nature: 'Optional' },
      { category: 'Mobile Recharge', allocatedAmount: 700, nature: 'Essential' },
      { category: 'Household / Cleaning', allocatedAmount: Math.round(budget * 0.05), nature: 'Variable' },
      { category: 'Medical / Healthcare', allocatedAmount: Math.round(budget * 0.06), nature: 'Essential' },
      { category: 'Shopping', allocatedAmount: Math.round(budget * 0.08), nature: 'Optional' },
      { category: 'Entertainment', allocatedAmount: Math.round(budget * 0.04), nature: 'Optional' },
      { category: 'Other', allocatedAmount: Math.max(500, Math.round(budget * 0.05)), nature: 'Optional' },
    ];

    const profile: BudgetProfile = {
      userName: userName.trim() || 'Household Member',
      monthlyIncome: income,
      totalMonthlyBudget: budget,
      savingsTarget: savings,
      emergencyBuffer: buffer,
      city: city.trim() || 'India',
      familySize,
      foodPreference,
      trackingStartDate: startDate || todayDate,
      categoryBudgets: defaultEnvelopes,
      hasCompletedOnboarding: true,
    };

    onComplete(profile);
  };

  return (
    <div
      id="onboarding-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Welcome to Smart Budget Tracker</span>
          </div>
          <h2 className="text-2xl font-bold mt-1">Set Up Your Household Envelope</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Let's configure your realistic monthly budget, savings goal, and tracking anchor date.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Manish"
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">City / Town</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Raipur"
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Monthly Income</label>
              <input
                type="number"
                value={incomeStr}
                onChange={(e) => setIncomeStr(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Expense Budget</label>
              <input
                type="number"
                value={budgetStr}
                onChange={(e) => setBudgetStr(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Savings Target</label>
              <input
                type="number"
                value={savingsTargetStr}
                onChange={(e) => setSavingsTargetStr(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Family Members</label>
              <input
                type="number"
                min="1"
                max="15"
                value={familySize}
                onChange={(e) => setFamilySize(parseInt(e.target.value) || 1)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Food Habit</label>
              <select
                value={foodPreference}
                onChange={(e) => setFoodPreference(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Veg">Vegetarian (शुद्ध शाकाहारी)</option>
                <option value="Eggetarian">Eggetarian (अंडा)</option>
                <option value="Non-Veg">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Tracking Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
            <span>Allocated for monthly living:</span>
            <span className="font-bold text-emerald-800 text-sm">
              {formatINR(budget)}
            </span>
          </div>

          <button
            type="submit"
            id="btn-complete-onboarding"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
          >
            Start Budget Tracking
          </button>
        </form>
      </div>
    </div>
  );
};
