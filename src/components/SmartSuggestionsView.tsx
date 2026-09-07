import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  Lightbulb,
  Sparkles,
  Target,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import { formatINR, generateSmartSuggestions } from '../lib/calculations';
import { BudgetProfile, ExpenseItem, SmartSuggestion } from '../types';

interface SmartSuggestionsViewProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  todayDate: string;
  onNavigateTab: (tab: any) => void;
}

export const SmartSuggestionsView: React.FC<SmartSuggestionsViewProps> = ({
  profile,
  expenses,
  todayDate,
  onNavigateTab,
}) => {
  const allSuggestions = generateSmartSuggestions(profile, expenses, todayDate);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const filtered = allSuggestions.filter((sug) => {
    if (selectedFilter === 'ALL') return true;
    return sug.category === selectedFilter;
  });

  const handleApply = (id: string) => {
    setAppliedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Personalized Financial Suggestions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every suggestion is dynamically derived from your recorded expenses, envelope thresholds, and location in {profile.city}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('whatif')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Simulate in What-If</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'Groceries & daily food', 'Discretionary & leisure', 'Utilities & bills', 'Transportation', 'Savings & investment'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedFilter === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((sug) => {
          const isApplied = appliedIds.includes(sug.id);

          return (
            <div
              key={sug.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
                isApplied
                  ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {sug.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {sug.title}
                    </h3>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold border border-emerald-200 whitespace-nowrap">
                    {sug.expectedSaving}
                  </div>
                </div>

                {/* 4 Core Pillars of the Suggestion */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      1. What happened:
                    </span>
                    <span className="text-slate-600">{sug.whatHappened}</span>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-0.5">
                      2. Why it matters:
                    </span>
                    <span className="text-amber-800">{sug.whyItMatters}</span>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-900 block mb-0.5">
                      3. Actionable step:
                    </span>
                    <span className="text-emerald-800">{sug.actionableSteps}</span>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-900 block mb-0.5">
                      4. Alternative option:
                    </span>
                    <span className="text-blue-800">{sug.alternativeOption}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleApply(sug.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isApplied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isApplied ? 'Target Adopted' : 'Adopt This Habit'}</span>
                </button>

                <button
                  onClick={() => onNavigateTab('whatif')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Test impact</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
