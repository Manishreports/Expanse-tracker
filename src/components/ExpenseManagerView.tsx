import React, { useMemo, useState } from 'react';
import {
  Copy,
  Download,
  Edit2,
  Filter,
  Plus,
  Receipt,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { ALL_CATEGORIES, exportExpensesToCSV, formatHumanDate, formatINR, PAYMENT_METHODS } from '../lib/calculations';
import { ExpenseCategory, ExpenseItem, ExpenseNature, PaymentMethod } from '../types';

interface ExpenseManagerViewProps {
  expenses: ExpenseItem[];
  onOpenAddModal: () => void;
  onEditExpense: (exp: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  onDuplicateExpense: (exp: ExpenseItem) => void;
}

export const ExpenseManagerView: React.FC<ExpenseManagerViewProps> = ({
  expenses,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
  onDuplicateExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedNature, setSelectedNature] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filtered & Sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchMerchant = item.merchant?.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchDesc && !matchMerchant && !matchCat) return false;
        }

        // Category
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
          return false;
        }

        // Nature
        if (selectedNature !== 'ALL' && item.nature !== selectedNature) {
          return false;
        }

        // Payment
        if (selectedPayment !== 'ALL' && item.paymentMethod !== selectedPayment) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchQuery, selectedCategory, selectedNature, selectedPayment, sortBy]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Expense History &amp; Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, filter, edit, or export every verified expense recorded in DhanSutra
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportExpensesToCSV(filteredExpenses)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, merchant..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Nature / Envelope Dropdown */}
          <div>
            <select
              value={selectedNature}
              onChange={(e) => setSelectedNature(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Envelope Types</option>
              <option value="Fixed">Fixed Bills</option>
              <option value="Variable">Variable (Grocery, Fuel)</option>
              <option value="Optional">Optional (Dining, Movies)</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="date-desc">Date (Newest first)</option>
              <option value="date-asc">Date (Oldest first)</option>
              <option value="amount-desc">Amount (Highest first)</option>
              <option value="amount-asc">Amount (Lowest first)</option>
            </select>
          </div>
        </div>

        {/* Summary of Filtered Items */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredExpenses.length}</strong> transactions
          </span>
          <span>
            Total: <strong className="text-emerald-700 font-bold">{formatINR(totalFilteredAmount)}</strong>
          </span>
        </div>
      </div>

      {/* Expenses Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No expenses found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description &amp; Merchant</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Envelope</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-600">
                      {formatHumanDate(item.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.description}
                      </div>
                      {item.merchant && (
                        <div className="text-[11px] text-slate-400">@ {item.merchant}</div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-slate-400 italic">"{item.notes}"</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.nature === 'Fixed'
                            ? 'bg-blue-50 text-blue-700'
                            : item.nature === 'Variable'
                            ? 'bg-amber-50 text-amber-700'
                            : item.nature === 'Optional'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.nature}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                      {item.paymentMethod}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-extrabold text-slate-900 text-sm">
                      {formatINR(item.amount)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          title="Duplicate"
                          onClick={() => onDuplicateExpense(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => onEditExpense(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete "${item.description}" (${formatINR(item.amount)})?`)) {
                              onDeleteExpense(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
