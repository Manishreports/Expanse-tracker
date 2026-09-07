import React, { useState } from 'react';
import { ShoppingCart, Calendar, CheckCircle, Plus, Trash2, Calculator } from 'lucide-react';
import { GroceryPlan, GroceryPlanItem } from '../types';
import { calculateGroceryPlan, formatINR } from '../lib/calculations';

interface GroceryPlannerViewProps {
  initialMonthly: number;
}

export const GroceryPlannerView: React.FC<GroceryPlannerViewProps> = ({ initialMonthly = 5000 }) => {
  const [totalMonthlyBudget, setTotalMonthlyBudget] = useState<number>(initialMonthly);
  const [fixedBills, setFixedBills] = useState<number>(700); // e.g. Mobile recharge ₹700
  const [emergencyBuffer, setEmergencyBuffer] = useState<number>(300); // e.g. Buffer ₹300
  const [periodDivisor, setPeriodDivisor] = useState<number>(4.3); // 4.3 average weeks, 4 calendar weeks, or dynamic

  // Dynamically calculated:
  // Remaining grocery budget = Total - Fixed bills - Buffer (e.g. 5000 - 700 - 300 = ₹4,000)
  const remainingGroceryBudget = Math.max(0, totalMonthlyBudget - fixedBills - emergencyBuffer);
  // Dynamic weekly target (e.g. 4000 / 4.3 = ₹930, not hard-coded ₹900)
  const weeklyGroceryTarget = Math.round(remainingGroceryBudget / periodDivisor);
  const dailyFoodBudget = Math.round(weeklyGroceryTarget / 7);

  const [plan, setPlan] = useState<GroceryPlan>(() =>
    calculateGroceryPlan(totalMonthlyBudget, fixedBills, emergencyBuffer, periodDivisor)
  );

  const [activeTab, setActiveTab] = useState<'plan' | 'list'>('plan');

  const handleUpdateItem = (catId: string, itemId: string, field: keyof GroceryPlanItem, val: any) => {
    setPlan((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => (item.id === itemId ? { ...item, [field]: val } : item)),
        };
      }),
    }));
  };

  const handleAddItem = (catId: string) => {
    const newItem: GroceryPlanItem = {
      id: `item_${Date.now()}`,
      name: 'New Item',
      quantity: 1,
      unit: 'kg',
      estimatedPrice: 60,
      frequency: 'weekly',
    };
    setPlan((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === catId ? { ...cat, items: [...cat.items, newItem] } : cat
      ),
    }));
  };

  const handleDeleteItem = (catId: string, itemId: string) => {
    setPlan((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === catId ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) } : cat
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <ShoppingCart className="w-4 h-4" />
            <span>Household Provisions & Ration Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Indian Grocery & Kitchen Planner
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic envelope budgeting split across weekly bazaar visits with zero food waste.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'plan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Envelope Breakdown
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Weekly Bazaar Checklist
          </button>
        </div>
      </div>

      {/* Dynamic Calculation Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Monthly Envelope Allocation & Dynamic Derivation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Grocery Pool (₹)
            </label>
            <input
              type="number"
              value={totalMonthlyBudget}
              onChange={(e) => setTotalMonthlyBudget(Math.max(0, parseInt(e.target.value) || 0))}
              className="mt-1 w-full text-xl font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Gross kitchen & household budget
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Fixed Household Bills (₹)
            </label>
            <input
              type="number"
              value={fixedBills}
              onChange={(e) => setFixedBills(Math.max(0, parseInt(e.target.value) || 0))}
              className="mt-1 w-full text-xl font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Mobile recharge, milkman dues
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Buffer / Emergency (₹)
            </label>
            <input
              type="number"
              value={emergencyBuffer}
              onChange={(e) => setEmergencyBuffer(Math.max(0, parseInt(e.target.value) || 0))}
              className="mt-1 w-full text-xl font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Guest hospitality or price surge cushion
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Dynamic Weekly Target (₹)
            </span>
            <div className="text-2xl font-extrabold text-emerald-950 mt-1">
              {formatINR(weeklyGroceryTarget)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              = Remaining ÷ {periodDivisor} wks
            </span>
          </div>
        </div>

        {/* Calculation Period Model & Transparent Methodology */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-800">
              Calculation Model / Period Divisor:
            </span>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPeriodDivisor(4.3)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  periodDivisor === 4.3
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Monthly Average (4.3 weeks)
              </button>
              <button
                type="button"
                onClick={() => setPeriodDivisor(4.0)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  periodDivisor === 4.0
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                4 Flat Weeks (4.0)
              </button>
              <button
                type="button"
                onClick={() => setPeriodDivisor(3.57)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  periodDivisor === 3.57
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Remaining in Sept (3.57 wks / 25 days)
              </button>
            </div>
          </div>

          <div className="text-slate-600 leading-relaxed text-[11px] pt-1 border-t border-slate-200/60">
            <strong className="text-slate-800 font-semibold">
              Why {formatINR(Math.round(remainingGroceryBudget / 4.3))} instead of {formatINR(Math.round(remainingGroceryBudget / 4.44))} or {formatINR(Math.round(remainingGroceryBudget / 4.0))}?
            </strong>{' '}
            A calendar month has on average 30.4 days (365 ÷ 12). Divided by 7 days/week, this yields{' '}
            <span className="font-semibold text-slate-800">4.345 average weeks per month</span> (standardized to 4.3 weeks).
            For your net grocery pool of {formatINR(remainingGroceryBudget)} (Total {formatINR(totalMonthlyBudget)} − Fixed Bills {formatINR(fixedBills)} − Buffer {formatINR(emergencyBuffer)}):
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-500">
              <li>
                <span className="text-slate-700 font-medium">Standard Monthly Average (4.3 weeks):</span> {formatINR(remainingGroceryBudget)} ÷ 4.3 ={' '}
                <strong className="text-emerald-700">{formatINR(Math.round(remainingGroceryBudget / 4.3))} / week</strong> (approx. {formatINR(Math.round(remainingGroceryBudget / 30.4))} / day).
              </li>
              <li>
                <span className="text-slate-700 font-medium">31-Day Division (4.44 weeks):</span> {formatINR(remainingGroceryBudget)} ÷ 4.44 = {formatINR(Math.round(remainingGroceryBudget / 4.44))} / week.
              </li>
              <li>
                <span className="text-slate-700 font-medium">Flat 4-Week Division:</span> {formatINR(remainingGroceryBudget)} ÷ 4.0 = {formatINR(Math.round(remainingGroceryBudget / 4.0))} / week.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Category Provisions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.categories.map((cat) => {
          const categorySum = cat.items.reduce((s, it) => s + it.estimatedPrice, 0);

          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                  <span className="text-[11px] text-slate-500">
                    Weekly Budget:{' '}
                    <strong className="text-emerald-700">{formatINR(cat.weeklyAllocation)}</strong>
                  </span>
                </div>
                <button
                  onClick={() => handleAddItem(cat.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-2">
                {cat.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800">{it.name}</span>
                      <span className="text-slate-500 block text-[11px]">
                        {it.quantity} {it.unit} • {it.frequency}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">
                        {formatINR(it.estimatedPrice)}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(cat.id, it.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Estimated Total:</span>
                <span
                  className={
                    categorySum <= cat.weeklyAllocation
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }
                >
                  {formatINR(categorySum)} / {formatINR(cat.weeklyAllocation)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
