import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Flame,
  HeartPulse,
  Menu,
  Moon,
  Plus,
  ShieldAlert,
  Wallet,
  X,
} from 'lucide-react';
import { formatHumanDate, formatINR } from '../lib/calculations';

interface NavbarProps {
  todayDate: string;
  dailyRecommendedLimit: number;
  healthScore: number;
  healthStatus: string;
  statusColor: 'green' | 'yellow' | 'red';
  missingCount: number;
  isTodayClosed: boolean;
  onOpenQuickAdd: () => void;
  onOpenCloseToday: () => void;
  onOpenSimulateMissing: () => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  todayDate,
  dailyRecommendedLimit,
  healthScore,
  healthStatus,
  statusColor,
  missingCount,
  isTodayClosed,
  onOpenQuickAdd,
  onOpenCloseToday,
  onOpenSimulateMissing,
  isMobileNavOpen,
  setIsMobileNavOpen,
}) => {
  const statusBadgeBg =
    statusColor === 'green'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : statusColor === 'yellow'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand & Date */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 shadow-xs font-black text-base">
                ₹
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg block leading-tight">
                  FiscAI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 hidden sm:block">
                  DhanSutra • Smart Assistant
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 ml-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatHumanDate(todayDate)}</span>
            </div>
          </div>

          {/* Center: Recommended Daily Limit & Health Pill */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Daily limit */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 shadow-2xs">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <div className="text-left leading-tight">
                <span className="text-[10px] text-emerald-700 font-semibold block uppercase tracking-wider">
                  आज की लिमिट
                </span>
                <span className="text-xs font-black text-emerald-950">
                  {formatINR(dailyRecommendedLimit)}
                </span>
              </div>
            </div>

            {/* Health Score */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusBadgeBg}`}>
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Health: {healthScore}/100</span>
            </div>

            {/* Missing days warning or badge */}
            {missingCount > 0 ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>{missingCount} Missing Days</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>All Days Closed</span>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Close Today Button */}
            <button
              id="btn-nav-close-today"
              onClick={onOpenCloseToday}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                isTodayClosed
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{isTodayClosed ? 'Today Closed' : "Close Today's Day"}</span>
            </button>

            {/* Fast Add Expense */}
            <button
              id="btn-nav-add-expense"
              onClick={onOpenQuickAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
