import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CalendarCheck,
  BarChart3,
  Settings,
  Layers,
  ShoppingCart,
  Lightbulb,
  PlusCircle,
  Menu,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  BudgetProfile,
  DailyRecord,
  DailyRecordStatus,
  ExpenseItem,
  RecurringExpense,
  SavingGoal,
} from './types';
import {
  getStoredProfile,
  saveBudgetProfile,
  getStoredExpenses,
  saveExpenses,
  getStoredDailyRecords,
  saveDailyRecords,
  getStoredRecurringExpenses,
  saveRecurringExpenses,
  getStoredSavingGoals,
  saveSavingGoals,
  resetToInitialSample,
  simulateMissingDaysForTesting,
} from './lib/storage';
import { findMissingHistoricalDates } from './lib/calculations';
import { DailyClosingModal } from './components/DailyClosingModal';
import { TodayClosingModal } from './components/TodayClosingModal';
import { OnboardingModal } from './components/OnboardingModal';
import { QuickAddExpenseModal } from './components/QuickAddExpenseModal';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { BudgetEnvelopesView } from './components/BudgetEnvelopesView';
import { ReportsView } from './components/ReportsView';
import { SuggestionsView } from './components/SuggestionsView';
import { GroceryPlannerView } from './components/GroceryPlannerView';
import { SettingsView } from './components/SettingsView';

const TODAY_DATE = '2026-09-06';

export function App() {
  const [profile, setProfile] = useState<BudgetProfile>(getStoredProfile);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(getStoredExpenses);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>(getStoredDailyRecords);
  const [recurring, setRecurring] = useState<RecurringExpense[]>(getStoredRecurringExpenses);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(getStoredSavingGoals);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'expenses' | 'envelopes' | 'reports' | 'grocery' | 'suggestions' | 'settings'
  >('dashboard');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [closeTodayOpen, setCloseTodayOpen] = useState(false);

  // Missing historical dates gatekeeper
  const missingDates = findMissingHistoricalDates(
    profile.trackingStartDate,
    TODAY_DATE,
    dailyRecords
  );

  const hasMissingDays = missingDates.length > 0;
  const currentMissingDate = hasMissingDays ? missingDates[0] : null;

  // Track initial missing count for progress indicator
  const [totalInitialMissing, setTotalInitialMissing] = useState<number>(missingDates.length);
  useEffect(() => {
    if (missingDates.length > totalInitialMissing) {
      setTotalInitialMissing(missingDates.length);
    }
  }, [missingDates.length, totalInitialMissing]);

  // Handler for closing a historical day via DailyClosingModal
  const handleSaveHistoricalDay = (
    date: string,
    status: DailyRecordStatus,
    totalAmount: number,
    itemizedExpenses: Omit<ExpenseItem, 'id' | 'createdAt'>[]
  ) => {
    const timestamp = new Date().toISOString();

    // 1. Create or update daily record
    const updatedDailyRecord: DailyRecord = {
      id: `daily_${date}`,
      date,
      status,
      totalExpense: totalAmount,
      transactionCount: itemizedExpenses.length,
      completedAt: timestamp,
      lastUpdated: timestamp,
    };

    const newDailyRecords = [
      ...dailyRecords.filter((r) => r.date !== date),
      updatedDailyRecord,
    ];
    setDailyRecords(newDailyRecords);
    saveDailyRecords(newDailyRecords);

    // 2. Add itemized expenses
    if (itemizedExpenses.length > 0) {
      const newExpenseItems: ExpenseItem[] = itemizedExpenses.map((exp, idx) => ({
        ...exp,
        id: `exp_${date}_${Date.now()}_${idx}`,
        createdAt: timestamp,
      }));

      const newExpenses = [...expenses, ...newExpenseItems];
      setExpenses(newExpenses);
      saveExpenses(newExpenses);
    }
  };

  // Handler for closing Today
  const handleConfirmCloseToday = (status: DailyRecordStatus, total: number) => {
    const timestamp = new Date().toISOString();
    const todayExpenses = expenses.filter((e) => e.date === TODAY_DATE);

    const record: DailyRecord = {
      id: `daily_${TODAY_DATE}`,
      date: TODAY_DATE,
      status,
      totalExpense: total,
      transactionCount: todayExpenses.length,
      completedAt: timestamp,
      lastUpdated: timestamp,
    };

    const updated = [...dailyRecords.filter((r) => r.date !== TODAY_DATE), record];
    setDailyRecords(updated);
    saveDailyRecords(updated);
  };

  // Handler for adding single expense
  const handleAddExpense = (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const timestamp = new Date().toISOString();
    const newExpense: ExpenseItem = {
      ...item,
      id: `exp_${Date.now()}`,
      createdAt: timestamp,
    };

    const newExpenses = [...expenses, newExpense];
    setExpenses(newExpenses);
    saveExpenses(newExpenses);

    // If day was ZERO_CONFIRMED, update status to RECORDED
    const targetDate = item.date;
    const existingRec = dailyRecords.find((r) => r.date === targetDate);
    if (existingRec) {
      const dateExpenses = newExpenses.filter((e) => e.date === targetDate);
      const newTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

      const updatedRec: DailyRecord = {
        ...existingRec,
        status: 'RECORDED',
        totalExpense: newTotal,
        transactionCount: dateExpenses.length,
        lastUpdated: timestamp,
      };

      const updatedDaily = [
        ...dailyRecords.filter((r) => r.date !== targetDate),
        updatedRec,
      ];
      setDailyRecords(updatedDaily);
      saveDailyRecords(updatedDaily);
    }
  };

  // Delete expense
  const handleDeleteExpense = (id: string) => {
    const itemToDelete = expenses.find((e) => e.id === id);
    if (!itemToDelete) return;

    const newExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(newExpenses);
    saveExpenses(newExpenses);

    const targetDate = itemToDelete.date;
    const existingRec = dailyRecords.find((r) => r.date === targetDate);
    if (existingRec) {
      const dateExpenses = newExpenses.filter((e) => e.date === targetDate);
      const newTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

      const updatedRec: DailyRecord = {
        ...existingRec,
        status: dateExpenses.length === 0 ? 'ZERO_CONFIRMED' : 'RECORDED',
        totalExpense: newTotal,
        transactionCount: dateExpenses.length,
        lastUpdated: new Date().toISOString(),
      };

      const updatedDaily = [
        ...dailyRecords.filter((r) => r.date !== targetDate),
        updatedRec,
      ];
      setDailyRecords(updatedDaily);
      saveDailyRecords(updatedDaily);
    }
  };

  // Profile update
  const handleUpdateProfile = (newProfile: BudgetProfile) => {
    setProfile(newProfile);
    saveBudgetProfile(newProfile);
  };

  // Reset data handler
  const handleResetData = () => {
    resetToInitialSample();
    setProfile(getStoredProfile());
    setExpenses(getStoredExpenses());
    setDailyRecords(getStoredDailyRecords());
    setRecurring(getStoredRecurringExpenses());
    setSavingGoals(getStoredSavingGoals());
  };

  // Simulate missing days handler
  const handleSimulateMissingDays = () => {
    simulateMissingDaysForTesting();
    setDailyRecords(getStoredDailyRecords());
    setTotalInitialMissing(2);
  };

  const todayExpenses = expenses.filter((e) => e.date === TODAY_DATE);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. First-Time Onboarding Modal */}
      {!profile.hasCompletedOnboarding && (
        <OnboardingModal
          isOpen={!profile.hasCompletedOnboarding}
          todayDate={TODAY_DATE}
          onComplete={(p) => {
            setProfile(p);
            saveBudgetProfile(p);
          }}
        />
      )}

      {/* 2. STRICT GATEKEEPER MODAL: Historical Missing Days */}
      {hasMissingDays && currentMissingDate && (
        <DailyClosingModal
          currentDate={currentMissingDate}
          dayIndex={Math.max(1, totalInitialMissing - missingDates.length + 1)}
          totalMissingDays={Math.max(totalInitialMissing, missingDates.length)}
          onSaveDay={handleSaveHistoricalDay}
        />
      )}

      {/* 3. Quick Add Expense Modal */}
      <QuickAddExpenseModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAddExpense={handleAddExpense}
        defaultDate={TODAY_DATE}
      />

      {/* 4. Close Today Modal */}
      <TodayClosingModal
        isOpen={closeTodayOpen}
        onClose={() => setCloseTodayOpen(false)}
        todayDate={TODAY_DATE}
        todayExpenses={todayExpenses}
        onConfirmCloseToday={handleConfirmCloseToday}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                Daily Budget Tracker
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Household Envelope System • Raipur
              </div>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'expenses'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('envelopes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'envelopes'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Envelopes
            </button>
            <button
              onClick={() => setActiveTab('grocery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'grocery'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grocery Planner
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'reports'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'suggestions'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Smart Suggestions
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'settings'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Settings
            </button>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('expenses');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Expenses Ledger
            </button>
            <button
              onClick={() => {
                setActiveTab('envelopes');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Budget Envelopes
            </button>
            <button
              onClick={() => {
                setActiveTab('grocery');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Grocery Planner
            </button>
            <button
              onClick={() => {
                setActiveTab('reports');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Reports & Charts
            </button>
            <button
              onClick={() => {
                setActiveTab('suggestions');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Smart Suggestions
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Settings
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            expenses={expenses}
            dailyRecords={dailyRecords}
            todayDate={TODAY_DATE}
            onOpenQuickAdd={() => setQuickAddOpen(true)}
            onOpenCloseToday={() => setCloseTodayOpen(true)}
            onNavigateToExpenses={() => setActiveTab('expenses')}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onAddExpenseClick={() => setQuickAddOpen(true)}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'envelopes' && (
          <BudgetEnvelopesView
            profile={profile}
            expenses={expenses}
            todayDate={TODAY_DATE}
          />
        )}

        {activeTab === 'grocery' && (
          <GroceryPlannerView
            initialMonthly={
              profile.categoryBudgets.find((c) => c.category === 'Grocery')?.allocatedAmount || 5000
            }
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            profile={profile}
            expenses={expenses}
            dailyRecords={dailyRecords}
          />
        )}

        {activeTab === 'suggestions' && (
          <SuggestionsView
            profile={profile}
            expenses={expenses}
            todayDate={TODAY_DATE}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
            onSimulateMissingDays={handleSimulateMissingDays}
          />
        )}
      </main>
    </div>
  );
}

export default App;
