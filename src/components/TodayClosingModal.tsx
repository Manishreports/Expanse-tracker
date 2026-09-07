import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, X } from 'lucide-react';
import { DailyRecordStatus, ExpenseItem } from '../types';
import { formatINR } from '../lib/calculations';

interface TodayClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayDate: string;
  todayExpenses: ExpenseItem[];
  onConfirmCloseToday: (status: DailyRecordStatus, total: number) => void;
}

export const TodayClosingModal: React.FC<TodayClosingModalProps> = ({
  isOpen,
  onClose,
  todayDate,
  todayExpenses,
  onConfirmCloseToday,
}) => {
  const [showZeroConfirm, setShowZeroConfirm] = useState(false);

  if (!isOpen) return null;

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleClose = () => {
    if (todayTotal === 0) {
      setShowZeroConfirm(true);
    } else {
      onConfirmCloseToday('RECORDED', todayTotal);
      onClose();
    }
  };

  const handleConfirmZero = () => {
    onConfirmCloseToday('ZERO_CONFIRMED', 0);
    setShowZeroConfirm(false);
    onClose();
  };

  return (
    <div
      id="today-closing-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Close Today's Expenses ({todayDate})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lock in your transactions before ending the day.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-medium block">
              Today's Recorded Spending
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {formatINR(todayTotal)}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              {todayExpenses.length} transactions logged
            </span>
          </div>

          {todayExpenses.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {todayExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-lg text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">
                      {exp.category}
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      {exp.description}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatINR(exp.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {showZeroConfirm && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-start gap-2 text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  क्या आप confirm करते हैं कि आज आपका कोई खर्च नहीं हुआ (कुल ₹0)?
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmZero}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
                >
                  Yes, Confirm ₹0
                </button>
                <button
                  type="button"
                  onClick={() => setShowZeroConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Add More First
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Close Day</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
