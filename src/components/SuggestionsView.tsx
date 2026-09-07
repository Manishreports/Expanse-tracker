import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BudgetProfile, ExpenseItem, SmartSuggestion } from '../types';
import { generateSmartSuggestions, formatINR } from '../lib/calculations';

interface SuggestionsViewProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  todayDate: string;
}

export const SuggestionsView: React.FC<SuggestionsViewProps> = ({
  profile,
  expenses,
  todayDate,
}) => {
  const suggestions: SmartSuggestion[] = generateSmartSuggestions(profile, expenses, todayDate);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          <span>Actionable Financial Intelligence</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          Smart Household Insights & Suggestions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Derived dynamically from your active transaction history and envelope velocity.
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 ${
              sug.severity === 'high'
                ? 'border-rose-200'
                : sug.severity === 'medium'
                ? 'border-amber-200'
                : 'border-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    sug.severity === 'high'
                      ? 'bg-rose-100 text-rose-700'
                      : sug.severity === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {sug.severity === 'high' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{sug.title}</h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Category: {sug.category}
                  </span>
                </div>
              </div>

              {sug.potentialSaving > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Potential Savings
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700">
                    +{formatINR(sug.potentialSaving)}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
              <strong className="text-slate-900">What Happened: </strong>
              {sug.whatHappened}
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-950 font-medium flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900">Action Plan: </strong>
                {sug.actionItem}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
