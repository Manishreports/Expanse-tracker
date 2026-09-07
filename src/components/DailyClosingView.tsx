import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { formatHumanDate, formatINR } from '../lib/calculations';
import { DailyRecord, ExpenseItem } from '../types';

interface DailyClosingViewProps {
  dailyRecords: DailyRecord[];
  expenses: ExpenseItem[];
  todayDate: string;
  onOpenMissingModal: () => void;
  onSimulateMissingDays: () => void;
  onConfirmZeroForDate: (date: string) => void;
  onOpenAddExpenseForDate: (date: string) => void;
}

export const DailyClosingView: React.FC<DailyClosingViewProps> = ({
  dailyRecords,
  expenses,
  todayDate,
  onOpenMissingModal,
  onSimulateMissingDays,
  onConfirmZeroForDate,
  onOpenAddExpenseForDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  const missingDays = dailyRecords.filter(
    (d) => d.status === 'MISSING' && d.date < todayDate
  );
  const completedDays = dailyRecords.filter(
    (d) => d.status === 'RECORDED' || d.status === 'ZERO_CONFIRMED'
  );
  const zeroDays = dailyRecords.filter((d) => d.status === 'ZERO_CONFIRMED');

  const selectedRecord = dailyRecords.find((d) => d.date === selectedDate);
  const selectedDayExpenses = expenses.filter((e) => e.date === selectedDate);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Daily Expense Status &amp; Check-in
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict No-Missing-Day Rule: Every calendar day must be explicitly closed with either verified expenses or confirmed ₹0.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {missingDays.length > 0 ? (
            <button
              onClick={onOpenMissingModal}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow animate-pulse flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Resolve {missingDays.length} Missing Days</span>
            </button>
          ) : (
            <button
              onClick={onSimulateMissingDays}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5"
              title="Test the mandatory gatekeeper check-in flow"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Simulate Missing Days</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Missing Historical Days</span>
          <span
            className={`text-2xl font-black block mt-1 ${
              missingDays.length > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {missingDays.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {missingDays.length > 0 ? 'Must be completed' : 'All days accounted for'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Completed Days</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {completedDays.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Closed ledger entries</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Confirmed ₹0 Days</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">
            {zeroDays.length}
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block font-medium">
            Zero spending verified
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Compliance Streak</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {missingDays.length === 0 ? 'Active 100%' : 'Needs Attention'}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Data integrity state</span>
        </div>
      </div>

      {/* Main Grid: Calendar Days + Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Days List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              September 2026 Calendar Audit
            </h2>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Recorded
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> ₹0 Confirmed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Missing
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {dailyRecords.map((rec) => {
              const isToday = rec.date === todayDate;
              const isSelected = rec.date === selectedDate;
              const isMissing = rec.status === 'MISSING';
              const isZero = rec.status === 'ZERO_CONFIRMED';
              const isFuture = rec.date > todayDate;

              const dayNumber = parseInt(rec.date.split('-')[2], 10);

              let badgeStyle = 'bg-slate-50 border-slate-200 text-slate-700';
              if (isMissing) {
                badgeStyle = 'bg-rose-50 border-rose-300 text-rose-800';
              } else if (isZero) {
                badgeStyle = 'bg-teal-50 border-teal-300 text-teal-800';
              } else if (rec.status === 'RECORDED') {
                badgeStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
              }

              return (
                <button
                  key={rec.date}
                  type="button"
                  onClick={() => setSelectedDate(rec.date)}
                  className={`p-3 rounded-xl border text-left transition relative ${badgeStyle} ${
                    isSelected ? 'ring-2 ring-emerald-600 shadow-xs' : 'hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Day {dayNumber}</span>
                    {isToday && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs font-black">
                    {isMissing
                      ? '⚠️ MISSING'
                      : isZero
                      ? '₹0 Verified'
                      : formatINR(rec.totalExpense)}
                  </div>

                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {isFuture
                      ? 'Upcoming'
                      : isMissing
                      ? 'Unclosed'
                      : `${rec.transactionCount} items`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Day Detail & Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          {selectedRecord ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {formatHumanDate(selectedDate)}
                  </h3>
                  <span
                    className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedRecord.status === 'MISSING'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedRecord.status === 'ZERO_CONFIRMED'
                        ? 'bg-teal-100 text-teal-800'
                        : selectedRecord.status === 'RECORDED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Status: {selectedRecord.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Total Spending</span>
                  <span className="text-lg font-black text-slate-900 block">
                    {formatINR(selectedRecord.totalExpense)}
                  </span>
                </div>
              </div>

              {/* Transactions for this selected day */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Transactions ({selectedDayExpenses.length})
                </span>

                {selectedDayExpenses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    {selectedRecord.status === 'ZERO_CONFIRMED'
                      ? 'This day was verified as ₹0 expense.'
                      : 'No expenses recorded for this day yet.'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {selectedDayExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">{exp.description}</span>
                          <span className="text-[10px] text-slate-400">
                            {exp.category} • {exp.paymentMethod}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">{formatINR(exp.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons for this day */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => onOpenAddExpenseForDate(selectedDate)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense for this Day</span>
                </button>

                {selectedRecord.status !== 'ZERO_CONFIRMED' && selectedRecord.totalExpense === 0 && (
                  <button
                    type="button"
                    onClick={() => onConfirmZeroForDate(selectedDate)}
                    className="w-full py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm ₹0 Spent on this Day</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 italic">Select a date from the calendar to inspect.</p>
          )}
        </div>
      </div>
    </div>
  );
};
