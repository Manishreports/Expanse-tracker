import {
  BudgetProfile,
  DailyRecord,
  ExpenseItem,
  RecurringExpense,
  SavingGoal,
} from '../types';

const PROFILE_KEY = 'budget_app_profile_v1';
const EXPENSES_KEY = 'budget_app_expenses_v1';
const DAILY_KEY = 'budget_app_daily_v1';
const RECURRING_KEY = 'budget_app_recurring_v1';
const GOALS_KEY = 'budget_app_goals_v1';

export const INITIAL_PROFILE: BudgetProfile = {
  userName: 'Manish Verma',
  monthlyIncome: 35000,
  totalMonthlyBudget: 28000,
  savingsTarget: 7000,
  emergencyBuffer: 1000,
  city: 'Raipur',
  familySize: 3,
  foodPreference: 'Veg',
  trackingStartDate: '2026-09-01',
  categoryBudgets: [
    { category: 'Grocery', allocatedAmount: 5000, nature: 'Essential' },
    { category: 'Food / Restaurant', allocatedAmount: 2000, nature: 'Optional' },
    { category: 'Fuel', allocatedAmount: 3000, nature: 'Variable' },
    { category: 'Fruits & Veg', allocatedAmount: 2000, nature: 'Variable' },
    { category: 'Milk & Dairy', allocatedAmount: 2000, nature: 'Essential' },
    { category: 'Mobile Recharge', allocatedAmount: 700, nature: 'Essential' },
    { category: 'Household / Cleaning', allocatedAmount: 1200, nature: 'Variable' },
    { category: 'Medical / Healthcare', allocatedAmount: 1500, nature: 'Essential' },
    { category: 'Shopping', allocatedAmount: 2000, nature: 'Optional' },
    { category: 'Entertainment', allocatedAmount: 1000, nature: 'Optional' },
    { category: 'Other', allocatedAmount: 1600, nature: 'Optional' },
  ],
  hasCompletedOnboarding: true,
};

export const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'exp_1', date: '2026-09-01', amount: 450, category: 'Grocery', description: 'Atta & Pulses', nature: 'Essential', createdAt: '2026-09-01T10:00:00Z' },
  { id: 'exp_2', date: '2026-09-01', amount: 150, category: 'Fruits & Veg', description: 'Potatoes & Tomatoes', nature: 'Variable', createdAt: '2026-09-01T11:00:00Z' },
  { id: 'exp_3', date: '2026-09-03', amount: 500, category: 'Fuel', description: 'Two wheeler petrol', nature: 'Variable', createdAt: '2026-09-03T09:30:00Z' },
  { id: 'exp_4', date: '2026-09-03', amount: 220, category: 'Food / Restaurant', description: 'Chai and evening snack with colleague', nature: 'Optional', createdAt: '2026-09-03T18:00:00Z' },
  { id: 'exp_5', date: '2026-09-04', amount: 350, category: 'Milk & Dairy', description: 'Milk weekly settlement', nature: 'Essential', createdAt: '2026-09-04T08:00:00Z' },
  { id: 'exp_6', date: '2026-09-05', amount: 120, category: 'Fruits & Veg', description: 'Fresh green vegetables', nature: 'Variable', createdAt: '2026-09-05T17:00:00Z' },
];

export const INITIAL_DAILY_RECORDS: DailyRecord[] = [
  { id: 'daily_2026-09-01', date: '2026-09-01', status: 'RECORDED', totalExpense: 600, transactionCount: 2, completedAt: '2026-09-01T21:00:00Z' },
  { id: 'daily_2026-09-02', date: '2026-09-02', status: 'ZERO_CONFIRMED', totalExpense: 0, transactionCount: 0, completedAt: '2026-09-02T21:30:00Z' },
  { id: 'daily_2026-09-03', date: '2026-09-03', status: 'RECORDED', totalExpense: 720, transactionCount: 2, completedAt: '2026-09-03T21:00:00Z' },
  { id: 'daily_2026-09-04', date: '2026-09-04', status: 'RECORDED', totalExpense: 350, transactionCount: 1, completedAt: '2026-09-04T22:00:00Z' },
  { id: 'daily_2026-09-05', date: '2026-09-05', status: 'RECORDED', totalExpense: 120, transactionCount: 1, completedAt: '2026-09-05T21:15:00Z' },
];

export const INITIAL_RECURRING: RecurringExpense[] = [
  { id: 'rec_1', name: 'Mobile Recharge (Jio / Airtel)', amount: 666, category: 'Mobile Recharge', dueDay: 14, frequency: 'monthly', status: 'Essential' },
  { id: 'rec_2', name: 'Milkman Monthly Account', amount: 1800, category: 'Milk & Dairy', dueDay: 5, frequency: 'monthly', status: 'Essential' },
  { id: 'rec_3', name: 'Electricity Utility Bill', amount: 1200, category: 'Other', dueDay: 20, frequency: 'monthly', status: 'Essential' },
];

export const INITIAL_GOALS: SavingGoal[] = [
  { id: 'goal_1', title: 'Emergency Fund (3 Months Expenses)', targetAmount: 75000, currentAmount: 38000, deadline: '2026-12-31', category: 'Security' },
  { id: 'goal_2', title: 'Diwali Festival Shopping Fund', targetAmount: 15000, currentAmount: 8500, deadline: '2026-10-25', category: 'Festivals' },
];

// LocalStorage helpers with safe fallback
export function getStoredProfile(): BudgetProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse budget profile', e);
  }
  return INITIAL_PROFILE;
}

export function saveBudgetProfile(profile: BudgetProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function getStoredExpenses(): ExpenseItem[] {
  try {
    const data = localStorage.getItem(EXPENSES_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse expenses', e);
  }
  return INITIAL_EXPENSES;
}

export function saveExpenses(expenses: ExpenseItem[]): void {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
}

export function getStoredDailyRecords(): DailyRecord[] {
  try {
    const data = localStorage.getItem(DAILY_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse daily records', e);
  }
  return INITIAL_DAILY_RECORDS;
}

export function saveDailyRecords(records: DailyRecord[]): void {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save daily records', e);
  }
}

export function getStoredRecurringExpenses(): RecurringExpense[] {
  try {
    const data = localStorage.getItem(RECURRING_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse recurring', e);
  }
  return INITIAL_RECURRING;
}

export function saveRecurringExpenses(rec: RecurringExpense[]): void {
  try {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(rec));
  } catch (e) {
    console.error('Failed to save recurring', e);
  }
}

export function getStoredSavingGoals(): SavingGoal[] {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse goals', e);
  }
  return INITIAL_GOALS;
}

export function saveSavingGoals(goals: SavingGoal[]): void {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals', e);
  }
}

export function resetToInitialSample(): void {
  saveBudgetProfile(INITIAL_PROFILE);
  saveExpenses(INITIAL_EXPENSES);
  saveDailyRecords(INITIAL_DAILY_RECORDS);
  saveRecurringExpenses(INITIAL_RECURRING);
  saveSavingGoals(INITIAL_GOALS);
}

export function simulateMissingDaysForTesting(): void {
  // Clears Sept 4 and Sept 5 daily records to test Gatekeeper modal
  const records = getStoredDailyRecords().filter(
    (r) => r.date !== '2026-09-04' && r.date !== '2026-09-05'
  );
  saveDailyRecords(records);
}
