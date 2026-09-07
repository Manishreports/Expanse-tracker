import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { BudgetProfile, DailyRecord, ExpenseItem } from '../types';
import { formatINR } from '../lib/calculations';

interface ReportsViewProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  dailyRecords: DailyRecord[];
}

const COLORS = [
  '#059669', // Emerald
  '#0284c7', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#475569', // Slate
  '#ca8a04', // Yellow
  '#2563eb', // Indigo
  '#ea580c', // Orange
];

export const ReportsView: React.FC<ReportsViewProps> = ({
  profile,
  expenses,
  dailyRecords,
}) => {
  // Aggregate daily expenses for the chart
  const dailyDataMap: Record<string, number> = {};
  expenses.forEach((e) => {
    dailyDataMap[e.date] = (dailyDataMap[e.date] || 0) + e.amount;
  });

  const dailyChartData = Object.keys(dailyDataMap)
    .sort()
    .map((date) => ({
      date: date.slice(5), // MM-DD
      amount: dailyDataMap[date],
    }));

  // Aggregate category expenses
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const categoryChartData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Expenditure Analytics</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          Financial Reports & Spending Breakdown
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Visual trends across daily spending cadence and category distributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Daily Spending (₹)</h3>
          <div className="h-64 w-full">
            {dailyChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense data available for charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Spending by Category</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <div className="text-xs text-slate-400">No category data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Category Summary Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Spent</th>
                <th className="p-3 text-right">Budget</th>
                <th className="p-3 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profile.categoryBudgets.map((cat) => {
                const spent = categoryMap[cat.category] || 0;
                const pct = totalSpent > 0 ? ((spent / totalSpent) * 100).toFixed(1) : '0';

                return (
                  <tr key={cat.category} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">{cat.category}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatINR(spent)}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {formatINR(cat.allocatedAmount)}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-600">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
