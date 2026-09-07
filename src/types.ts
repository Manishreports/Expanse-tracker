export type ExpenseCategory =
  | 'Grocery'
  | 'Food / Restaurant'
  | 'Fuel'
  | 'Fruits & Veg'
  | 'Mobile Recharge'
  | 'Milk & Dairy'
  | 'Household / Cleaning'
  | 'Medical / Healthcare'
  | 'Shopping'
  | 'Entertainment'
  | 'Other';

export type ExpenseNature = 'Essential' | 'Variable' | 'Optional';

export interface ExpenseItem {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: ExpenseCategory;
  description: string;
  nature: ExpenseNature;
  createdAt: string;
}

export type DailyRecordStatus = 'MISSING' | 'RECORDED' | 'ZERO_CONFIRMED';

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  status: DailyRecordStatus;
  totalExpense: number;
  transactionCount: number;
  completedAt?: string;
  lastUpdated?: string;
  notes?: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  allocatedAmount: number;
  nature: ExpenseNature;
}

export interface BudgetProfile {
  userName: string;
  monthlyIncome: number;
  totalMonthlyBudget: number;
  savingsTarget: number;
  emergencyBuffer?: number;
  city: string;
  familySize: number;
  foodPreference: 'Veg' | 'Non-Veg' | 'Eggetarian';
  trackingStartDate: string; // YYYY-MM-DD
  categoryBudgets: CategoryBudget[];
  hasCompletedOnboarding?: boolean;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  dueDay: number; // 1 - 31
  frequency: 'monthly' | 'annual';
  status: 'Essential' | 'Optional';
}

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
}

export interface GroceryPlanItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'kg' | 'g' | 'L' | 'packet' | 'dozen';
  estimatedPrice: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
}

export interface GroceryCategoryGroup {
  id: string;
  name: string;
  weeklyAllocation: number;
  items: GroceryPlanItem[];
}

export interface GroceryPlan {
  totalMonthlyBudget: number;
  fixedBills: number;
  emergencyBuffer: number;
  weeklyGroceryTarget: number;
  periodDivisor: number; // 4.3 or 4.0 or custom
  categories: GroceryCategoryGroup[];
}

export interface SmartSuggestion {
  id: string;
  category: ExpenseCategory | 'General';
  title: string;
  whatHappened: string;
  actionItem: string;
  potentialSaving: number;
  severity: 'low' | 'medium' | 'high';
  type: 'overspending' | 'grocery-pacing' | 'habit' | 'savings';
}
