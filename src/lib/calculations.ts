import {
  BudgetProfile,
  DailyRecord,
  ExpenseCategory,
  ExpenseItem,
  ExpenseNature,
  GroceryPlan,
  RecurringExpense,
  SmartSuggestion,
} from '../types';

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

/**
 * Finds all missing calendar dates between trackingStartDate (inclusive)
 * and todayDate (exclusive) that have not been closed (i.e. neither RECORDED nor ZERO_CONFIRMED).
 * Returned in strict chronological ascending order (oldest first).
 */
export function findMissingHistoricalDates(
  startDateStr: string,
  todayDateStr: string,
  dailyRecords: DailyRecord[]
): string[] {
  if (!startDateStr || !todayDateStr || startDateStr >= todayDateStr) {
    return [];
  }

  const [sY, sM, sD] = startDateStr.split('-').map(Number);
  const [tY, tM, tD] = todayDateStr.split('-').map(Number);

  const start = new Date(sY, sM - 1, sD, 12, 0, 0);
  const end = new Date(tY, tM - 1, tD, 12, 0, 0);

  const missing: string[] = [];
  const curr = new Date(start);

  while (curr < end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    const record = dailyRecords.find((r) => r.date === dateKey);
    const isClosed =
      record && (record.status === 'RECORDED' || record.status === 'ZERO_CONFIRMED');

    if (!isClosed) {
      missing.push(dateKey);
    }

    curr.setDate(curr.getDate() + 1);
  }

  return missing;
}

export interface DashboardSummary {
  totalMonthlyBudget: number;
  totalSpent: number;
  remainingMoney: number;
  todaySpent: number;
  weekSpent: number;
  dailyRecommended: number;
  daysPassed: number;
  daysRemaining: number;
  burnRatePercentage: number;
  monthlyIncome: number;
  savingsTarget: number;
  projectedSavings: number;
  isOverbudget: boolean;
}

export function calculateDashboardSummary(
  profile: BudgetProfile,
  expenses: ExpenseItem[],
  recurring: RecurringExpense[],
  dailyRecords: DailyRecord[],
  todayStr: string = '2026-09-06'
): DashboardSummary {
  const [year, month, day] = todayStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - day + 1);
  const daysPassed = Math.max(1, day);

  const currentMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = profile.totalMonthlyBudget || 25000;
  const remainingMoney = totalBudget - totalSpent;

  // Today spending
  const todayExpenses = monthExpenses.filter((e) => e.date === todayStr);
  const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // This week's spending (since Monday)
  const todayDateObj = new Date(year, month - 1, day, 12, 0, 0);
  const dayOfWeek = todayDateObj.getDay(); // 0 is Sun, 1 is Mon
  const mondayOffset = (dayOfWeek + 6) % 7;
  const mondayDate = new Date(todayDateObj);
  mondayDate.setDate(todayDateObj.getDate() - mondayOffset);

  const mY = mondayDate.getFullYear();
  const mM = String(mondayDate.getMonth() + 1).padStart(2, '0');
  const mD = String(mondayDate.getDate()).padStart(2, '0');
  const mondayStr = `${mY}-${mM}-${mD}`;

  const weekExpenses = monthExpenses.filter((e) => e.date >= mondayStr && e.date <= todayStr);
  const weekSpent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Daily recommended
  const dailyRecommended = Math.max(0, Math.round(remainingMoney / daysRemaining));
  const burnRatePercentage = Math.round((totalSpent / totalBudget) * 100);

  const projectedSavings = Math.max(
    0,
    profile.monthlyIncome - (totalSpent + (dailyRecommended * (daysRemaining - 1)))
  );

  return {
    totalMonthlyBudget: totalBudget,
    totalSpent,
    remainingMoney,
    todaySpent,
    weekSpent,
    dailyRecommended,
    daysPassed,
    daysRemaining,
    burnRatePercentage,
    monthlyIncome: profile.monthlyIncome,
    savingsTarget: profile.savingsTarget,
    projectedSavings,
    isOverbudget: remainingMoney < 0,
  };
}

export function smartCategorize(text: string): { category: ExpenseCategory; nature: ExpenseNature } {
  const lower = text.toLowerCase();

  if (/(sabzi|vegetable|aloo|pyaz|tamatar|fruit|kela|apple|mango|bhindi)/.test(lower)) {
    return { category: 'Fruits & Veg', nature: 'Variable' };
  }
  if (/(doodh|milk|paneer|curd|dahi|butter|amul|dairy)/.test(lower)) {
    return { category: 'Milk & Dairy', nature: 'Essential' };
  }
  if (/(petrol|diesel|fuel|cng|auto|uber|ola|bus|metro|rickshaw)/.test(lower)) {
    return { category: 'Fuel', nature: 'Variable' };
  }
  if (/(restaurant|swiggy|zomato|chai|samosa|snack|dinner|lunch|hotel|biryani|pizza|burger)/.test(lower)) {
    return { category: 'Food / Restaurant', nature: 'Optional' };
  }
  if (/(recharge|jio|airtel|vi|wifi|broadband|phone)/.test(lower)) {
    return { category: 'Mobile Recharge', nature: 'Essential' };
  }
  if (/(dawa|medicine|doctor|clinic|tablet|syrup|hospital|medical)/.test(lower)) {
    return { category: 'Medical / Healthcare', nature: 'Essential' };
  }
  if (/(surf|soap|detergent|vim|harpic|clean|colgate|paste)/.test(lower)) {
    return { category: 'Household / Cleaning', nature: 'Variable' };
  }
  if (/(cloth|shirt|pant|shoes|amazon|flipkart|dress|saree)/.test(lower)) {
    return { category: 'Shopping', nature: 'Optional' };
  }
  if (/(movie|cinema|netflix|hotstar|game|outing)/.test(lower)) {
    return { category: 'Entertainment', nature: 'Optional' };
  }
  if (/(ration|atta|rice|dal|oil|tel|cheeni|sugar|masala|grocery|kirana)/.test(lower)) {
    return { category: 'Grocery', nature: 'Essential' };
  }

  return { category: 'Other', nature: 'Optional' };
}

export function generateSmartSuggestions(
  profile: BudgetProfile,
  expenses: ExpenseItem[],
  todayStr: string = '2026-09-06'
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const [year, month] = todayStr.split('-').map(Number);
  const currentMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));

  // Category totals
  const categoryTotals: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  // Food / Restaurant check
  const foodBudget =
    profile.categoryBudgets.find((c) => c.category === 'Food / Restaurant')?.allocatedAmount || 2000;
  const foodSpent = categoryTotals['Food / Restaurant'] || 0;

  if (foodSpent > foodBudget) {
    const diff = foodSpent - foodBudget;
    suggestions.push({
      id: 'sug_food_over',
      category: 'Food / Restaurant',
      title: 'Restaurant & Dining Overspending Alert',
      whatHappened: `Food spending is ${formatINR(foodSpent)}, exceeding your allocated budget of ${formatINR(foodBudget)} by ${formatINR(diff)}.`,
      actionItem: 'Prepare dinner at home for the next 4 days to save ₹600-₹800 and bring your discretionary food spending back on track.',
      potentialSaving: 800,
      severity: 'high',
      type: 'overspending',
    });
  } else if (foodSpent > foodBudget * 0.7) {
    suggestions.push({
      id: 'sug_food_warn',
      category: 'Food / Restaurant',
      title: 'Dining Out Pacing Notice',
      whatHappened: `You have utilized ${Math.round((foodSpent / foodBudget) * 100)}% of your dining-out pool (${formatINR(foodSpent)} / ${formatINR(foodBudget)}).`,
      actionItem: 'Cap online snack orders to weekend evenings only.',
      potentialSaving: 450,
      severity: 'medium',
      type: 'habit',
    });
  }

  // Grocery check
  const groceryBudget =
    profile.categoryBudgets.find((c) => c.category === 'Grocery')?.allocatedAmount || 5000;
  const grocerySpent = categoryTotals['Grocery'] || 0;
  if (grocerySpent > 0 && grocerySpent > groceryBudget * 0.8) {
    suggestions.push({
      id: 'sug_grocery_pacing',
      category: 'Grocery',
      title: 'Grocery Envelope Pacing',
      whatHappened: `Grocery spending is at ${formatINR(grocerySpent)} (${Math.round((grocerySpent / groceryBudget) * 100)}% of monthly allocation).`,
      actionItem: 'Consolidate staple purchases into a single weekly bazaar trip rather than multiple small daily visits.',
      potentialSaving: 500,
      severity: 'medium',
      type: 'grocery-pacing',
    });
  }

  // General savings encouragement
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'sug_general_on_track',
      category: 'General',
      title: 'Healthy Budget Disciplines',
      whatHappened: 'Your daily spending remains well within your projected limits this month.',
      actionItem: 'Automate transfer of your monthly target savings into a high-interest recurring deposit on salary day.',
      potentialSaving: 1200,
      severity: 'low',
      type: 'savings',
    });
  }

  return suggestions;
}

export function calculateGroceryPlan(
  monthlyGroceryEnvelope: number,
  fixedBills: number,
  emergencyBuffer: number,
  periodDivisor: number = 4.3
): GroceryPlan {
  const remainingGroceryBudget = Math.max(0, monthlyGroceryEnvelope - fixedBills - emergencyBuffer);
  const weeklyTarget = Math.round(remainingGroceryBudget / periodDivisor);

  return {
    totalMonthlyBudget: monthlyGroceryEnvelope,
    fixedBills,
    emergencyBuffer,
    weeklyGroceryTarget: weeklyTarget,
    periodDivisor,
    categories: [
      {
        id: 'staples',
        name: 'Grains, Atta & Pulses (दाल, चावल, आटा)',
        weeklyAllocation: Math.round(weeklyTarget * 0.35),
        items: [
          { id: 'g1', name: 'Sharbati Wheat Atta', quantity: 5, unit: 'kg', estimatedPrice: 195, frequency: 'weekly' },
          { id: 'g2', name: 'Kolam / Basmati Rice', quantity: 2, unit: 'kg', estimatedPrice: 110, frequency: 'weekly' },
          { id: 'g3', name: 'Toor & Moong Dal', quantity: 1, unit: 'kg', estimatedPrice: 155, frequency: 'weekly' },
        ],
      },
      {
        id: 'dairy_oils',
        name: 'Dairy & Cooking Oils (दूध, तेल, घी)',
        weeklyAllocation: Math.round(weeklyTarget * 0.30),
        items: [
          { id: 'g4', name: 'Mustard / Sunflower Oil', quantity: 1, unit: 'L', estimatedPrice: 145, frequency: 'weekly' },
          { id: 'g5', name: 'Fresh Full Cream Milk', quantity: 7, unit: 'L', estimatedPrice: 420, frequency: 'weekly' },
        ],
      },
      {
        id: 'fresh_produce',
        name: 'Fresh Vegetables & Spices (सब्जियां व मसाले)',
        weeklyAllocation: Math.round(weeklyTarget * 0.25),
        items: [
          { id: 'g6', name: 'Aloo, Pyaz & Tamatar', quantity: 5, unit: 'kg', estimatedPrice: 160, frequency: 'weekly' },
          { id: 'g7', name: 'Seasonal Green Veggies', quantity: 3, unit: 'kg', estimatedPrice: 130, frequency: 'weekly' },
        ],
      },
      {
        id: 'household',
        name: 'Household & Cleaning (साफ-सफाई)',
        weeklyAllocation: Math.round(weeklyTarget * 0.10),
        items: [
          { id: 'g8', name: 'Detergent & Dishwashing bar', quantity: 1, unit: 'packet', estimatedPrice: 85, frequency: 'weekly' },
        ],
      },
    ],
  };
}
