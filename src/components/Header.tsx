import React, { useState } from 'react';
import { 
  Egg, 
  Plus, 
  RefreshCw, 
  Download, 
  Palette, 
  Moon, 
  Sun, 
  Menu, 
  X,
  LayoutDashboard,
  Feather,
  Home,
  BookOpen,
  BarChart3,
  Wheat,
  HeartPulse,
  DollarSign,
  Lock,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogEggs: () => void;
  onOpenAddChicken: () => void;
  onResetData: () => void;
  onExportBackup: () => void;
  onOpenThemeModal: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogEggs,
  onOpenAddChicken,
  onResetData,
  onExportBackup,
  onOpenThemeModal,
  onOpenLoginModal,
}) => {
  const { theme, isDark, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'eggs', label: 'Daily Eggs', icon: Egg },
    { id: 'flock', label: 'Flock', icon: Feather },
    { id: 'coops', label: 'Coops', icon: Home },
    { id: 'feed', label: 'Feed & Supplies', icon: Wheat },
    { id: 'incubation', label: 'Incubation', icon: Sparkles },
    { id: 'health', label: 'Health & Security', icon: HeartPulse },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'breeds', label: 'Breed Library', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 w-full">
            {/* Zone 1: Brand Wordmark */}
            <button
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center gap-2 text-left text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 min-w-0 hover:opacity-85 transition-opacity cursor-pointer shrink-0"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Egg className="w-5 h-5 fill-white/80" />
              </div>
              <span className="truncate">Flocker</span>
            </button>

            {/* Zone 2: Desktop scrollable clean nav links */}
            <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold text-stone-600 dark:text-stone-300 overflow-x-auto no-scrollbar py-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'text-stone-950 dark:text-stone-100 font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Desktop primary button, Auth & quick actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {/* Login / User Profile Security Trigger */}
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign in to secure flock data with Firebase'}
              >
                {user ? (
                  <>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate max-w-[100px] text-stone-800 dark:text-stone-200">
                      {user.displayName?.split(' ')[0] || 'User'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Cloud Database Synced" />
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-stone-700 dark:text-stone-300">Sign In</span>
                  </>
                )}
              </button>

              {/* Theme Picker trigger */}
              <button
                onClick={onOpenThemeModal}
                title={`Active Theme: ${theme.name}. Click to switch theme.`}
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                aria-label="Theme settings"
              >
                <Palette className="w-4 h-4" />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-stone-600"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                title={isDark ? "Switch to daylight mode" : "Switch to Night Roost dark mode"}
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={onResetData}
                title="Clear all data to a clean slate"
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Clear data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={onExportBackup}
                title="Export backup JSON"
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Export backup"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAddChicken}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bird</span>
              </button>

              <button
                onClick={onOpenLogEggs}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Eggs</span>
              </button>
            </div>

            {/* Mobile Top Controls (Clear touch targets, single row) */}
            <div className="flex lg:hidden items-center gap-1 shrink-0">
              {/* User Login/Avatar in mobile top bar */}
              <button
                onClick={onOpenLoginModal}
                className="p-1.5 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                aria-label="Account Login"
              >
                {user ? (
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
              </button>

              {/* Quick Dark Mode toggle */}
              <button
                onClick={toggleDarkMode}
                title={isDark ? "Switch to daylight mode" : "Switch to Night Roost dark mode"}
                className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-500 dark:text-stone-400" />}
              </button>

              {/* Theme Picker trigger */}
              <button
                onClick={onOpenThemeModal}
                title="Select Theme"
                className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Theme settings"
              >
                <Palette className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </button>

              {/* Log Eggs Mobile Action */}
              <button
                onClick={onOpenLogEggs}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Log</span>
              </button>

              {/* Tools & More Drawer Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Strip for Desktop (when between lg and xl) and Mobile */}
        <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/95 px-2 py-1.5 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-700 dark:bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 font-medium'
                  }`}
                  style={isActive ? { backgroundColor: theme.colors.primary } : undefined}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Secondary Tools Drawer (Opens on hamburger tap) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white/98 dark:bg-stone-900/98 backdrop-blur-md px-4 py-4 space-y-4 shadow-xl max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                Homestead Tools & Account
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLoginModal();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="text-left truncate">
                    <span className="block truncate">{user ? user.displayName || 'Account' : 'Sign In'}</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">
                      {user ? 'Cloud Protected' : 'Secure Data'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenThemeModal();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="text-left truncate">
                    <span className="block truncate">{theme.name}</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">Switch Theme</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAddChicken();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Register Bird</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExportBackup();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>Backup JSON</span>
                </button>
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onResetData();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear All Data (Fresh Slate)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
