import React from 'react';
import {
  BarChart3,
  Bot,
  CalendarCheck,
  Compass,
  CreditCard,
  Flame,
  HelpCircle,
  History,
  Home,
  Layers,
  Lightbulb,
  Receipt,
  Settings,
  ShoppingBag,
  Sliders,
  Sparkles,
  Target,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'expenses'
  | 'budget'
  | 'daily'
  | 'suggestions'
  | 'grocery'
  | 'whatif'
  | 'reports'
  | 'ai'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isLocked: boolean;
  missingCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isLocked,
  missingCount,
  isMobileOpen,
  onCloseMobile,
  userName = 'Rahul Kumar',
}) => {
  const userInitials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'RK';

  const navItems: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'budget', label: 'Budget & Envelopes', icon: Wallet },
    {
      id: 'daily',
      label: 'Daily Closing',
      icon: CalendarCheck,
      badge: missingCount > 0 ? `${missingCount}` : undefined,
    },
    { id: 'grocery', label: 'Grocery Planner', icon: ShoppingBag },
    { id: 'whatif', label: 'Savings Goals', icon: Target },
    { id: 'suggestions', label: 'Smart Suggestions', icon: Lightbulb },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'ai', label: 'AI Assistant', icon: Bot, badge: 'Smart' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    if (isLocked && tab !== 'daily') {
      alert('Please complete all missing historical days before navigating to other screens!');
      return;
    }
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 text-lg font-bold shadow-xs">
                ₹
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">FiscAI</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">DhanSutra</span>
              </div>
            </h1>
          </div>

          <div className="p-4 flex-1 space-y-1">
            {isLocked && (
              <div className="mb-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                <span className="font-bold block mb-0.5 text-rose-200">⚠️ No Missing Day Rule</span>
                {missingCount} day(s) missing records. Complete daily check-in to unlock full app.
              </div>
            )}

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Navigation
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const disabled = isLocked && item.id !== 'daily';
                const isDailyPending = item.id === 'daily' && missingCount > 0;

                let buttonClass = 'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ';
                if (isActive) {
                  buttonClass += 'bg-slate-800 text-white font-semibold shadow-xs';
                } else if (isDailyPending) {
                  buttonClass += 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 font-semibold';
                } else if (disabled) {
                  buttonClass += 'text-slate-600 cursor-not-allowed opacity-50';
                } else {
                  buttonClass += 'text-slate-400 hover:bg-slate-800 hover:text-white';
                }

                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    disabled={disabled}
                    className={`w-full ${buttonClass}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-emerald-400'
                          : isDailyPending
                          ? 'text-emerald-400'
                          : disabled
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>

                    {item.badge && (
                      <span
                        className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                          isDailyPending
                            ? 'bg-emerald-600 text-white'
                            : isActive
                            ? 'bg-slate-700 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => handleNavClick('settings')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-200 text-xs truncate">{userName}</p>
              <p className="text-[11px] opacity-70 truncate">Settings</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
