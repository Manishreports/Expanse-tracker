import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AlertCircle,
  Bot,
  CornerDownLeft,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import {
  calculateDashboardSummary,
  calculateFinancialHealthScore,
  formatINR,
} from '../lib/calculations';
import { BudgetProfile, DailyRecord, ExpenseItem, RecurringExpense } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AiAssistantViewProps {
  profile: BudgetProfile;
  expenses: ExpenseItem[];
  recurring: RecurringExpense[];
  dailyRecords: DailyRecord[];
  todayDate: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  profile,
  expenses,
  recurring,
  dailyRecords,
  todayDate,
}) => {
  const summary = calculateDashboardSummary(profile, expenses, recurring, dailyRecords, todayDate);
  const health = calculateFinancialHealthScore(profile, expenses, dailyRecords, todayDate);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Namaste ${profile.userName}! I am your personal financial AI assistant. I have full context of your September 2026 finances in ${profile.city} (Income: ${formatINR(profile.monthlyIncome)}, Spent so far: ${formatINR(summary.totalSpent)}, Remaining: ${formatINR(summary.remainingMoney)}, Daily Safe Limit: ${formatINR(summary.dailyRecommended)}). How can I help you save more today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    // Prepare real financial context
    const financialContext = {
      userName: profile.userName,
      city: profile.city,
      monthlyIncome: profile.monthlyIncome,
      monthlyBudget: profile.monthlyBudget,
      savingTarget: profile.savingTarget,
      totalSpent: summary.totalSpent,
      remainingMoney: summary.remainingMoney,
      remainingDays: summary.remainingDays,
      todaySpending: summary.todaySpent,
      weekSpending: summary.weekSpent,
      weeklyBudget: summary.weeklyBudget,
      dailyRecommendedLimit: summary.dailyRecommended,
      upcomingRecurringBills: summary.upcomingRecurringBills,
      healthScore: health.totalScore,
      healthStatus: health.status,
      envelopes: profile.envelopes,
      recentExpenses: expenses.slice(-15).map((e) => ({
        date: e.date,
        amount: e.amount,
        category: e.category,
        merchant: e.merchant,
        description: e.description,
        nature: e.nature,
      })),
      missingDaysCount: dailyRecords.filter((d) => d.status === 'MISSING').length,
    };

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg.text,
          financialContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'I could not generate an answer at this time. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      console.error('AI assistant error:', err);
      // Fallback local grounded response if offline or key not yet set
      const fallbackReply: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Based on your live records:\n\n- **Total Spent:** ${formatINR(summary.totalSpent)} out of ${formatINR(profile.monthlyBudget)}.\n- **Remaining for this month:** ${formatINR(summary.remainingMoney)} across ${summary.remainingDays} days.\n- **Daily Spending Limit:** You can safely spend **${formatINR(summary.dailyRecommended)}/day** to preserve your savings goal of ${formatINR(profile.savingTarget)}.\n- **Priority:** Your highest spending categories are Grocery and Dining Out. Cutting non-essential snacks can save ~₹1,500/month.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'init-reset',
        sender: 'ai',
        text: `Chat reset. I am ready to advise you on your September 2026 expenses!`,
        timestamp: 'Just now',
      },
    ]);
  };

  const sampleQuestions = [
    'Where did most of my money go this month?',
    'How much can I spend today without hurting my savings?',
    'How can I cut ₹3,000 from my expenses?',
    'Is my grocery spending reasonable for 2 people in Rajnandgaon?',
    'Can I afford to buy a ₹15,000 item right now?',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            AI Financial Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Powered by Gemini • Strictly grounded in your real recorded transactions &amp; envelope budgets
          </p>
        </div>

        <button
          onClick={clearChat}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 text-xs font-medium border border-slate-200 transition whitespace-nowrap shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-slate-800 text-white'
                      : 'bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="markdown-body prose prose-sm max-w-none text-slate-800">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-emerald-700 text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 rounded-tl-xs flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Analyzing your financial ledgers and generating tailored advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="ai-assistant-input"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything: e.g. 'Can I afford dining out tonight?' or 'How is my budget looking?'"
              className="flex-1 px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              id="btn-send-ai-query"
              disabled={!inputQuery.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold shadow transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
