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
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogEggs: () => void;
  onOpenAddChicken: () => void;
  onResetData: () => void;
  onExportBackup: () => void;
  onOpenThemeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogEggs,
  onOpenAddChicken,
  onResetData,
  onExportBackup,
  onOpenThemeModal,
}) => {
  const { theme, isDark, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'eggs', label: 'Daily Eggs', icon: Egg },
    { id: 'flock', label: 'Flock & Growth', icon: Feather },
    { id: 'coops', label: 'Coops', icon: Home },
    { id: 'breeds', label: 'Breed Library', icon: BookOpen },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
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
              className="flex items-center gap-2 text-left text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 min-w-0 hover:opacity-85 transition-opacity"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Egg className="w-5 h-5 fill-white/80" />
              </div>
              <span className="truncate">Cluck & Clutch</span>
            </button>

            {/* Zone 2: Desktop 4-6 concise nav links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'text-stone-950 dark:text-stone-100 font-semibold'
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

            {/* Zone 3: Desktop primary button & quick actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {/* Theme Picker trigger */}
              <button
                onClick={onOpenThemeModal}
                title={`Active Theme: ${theme.name}. Click to switch theme.`}
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5"
                aria-label="Theme settings"
              >
                <Palette className="w-4 h-4" />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-stone-600"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              </button>

              {/* Quick 1-click Dark/Night mode toggle */}
              <button
                onClick={toggleDarkMode}
                title={isDark ? "Switch to daylight mode" : "Switch to Night Roost dark mode"}
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={onResetData}
                title="Reset sample homestead data"
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                aria-label="Reset demo data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={onExportBackup}
                title="Export backup JSON"
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                aria-label="Export backup"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAddChicken}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bird</span>
              </button>

              <button
                onClick={onOpenLogEggs}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Eggs</span>
              </button>
            </div>

            {/* Mobile Top Controls (Clear touch targets, single row) */}
            <div className="flex lg:hidden items-center gap-1 shrink-0">
              {/* Quick Dark Mode toggle */}
              <button
                onClick={toggleDarkMode}
                title={isDark ? "Switch to daylight mode" : "Switch to Night Roost dark mode"}
                className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-500 dark:text-stone-400" />}
              </button>

              {/* Theme Picker trigger */}
              <button
                onClick={onOpenThemeModal}
                title="Select Theme"
                className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1"
                aria-label="Theme settings"
              >
                <Palette className="w-4 h-4" />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-stone-600"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              </button>

              {/* Quick Log button */}
              <button
                onClick={onOpenLogEggs}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors whitespace-nowrap"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>

              {/* Tools & More Drawer Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Tab Navigation Strip (Thumb-friendly & directly in top nav) */}
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/95 px-2 py-1.5 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 transition-all ${
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
            {/* Quick Actions & Settings Grid */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                Homestead Tools & Theme Controls
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenThemeModal();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="text-left truncate">
                    <span className="block truncate">{theme.name}</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">Switch Theme</span>
                  </div>
                </button>

                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />}
                  <div className="text-left">
                    <span>{isDark ? 'Day Light' : 'Night Roost'}</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal block">{isDark ? 'Dark Mode On' : 'Dark Mode Off'}</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAddChicken();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Register Bird</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExportBackup();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Sample Flock Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
