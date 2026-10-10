import React from 'react';
import { X, Check, Moon, Sun, Palette, Sparkles } from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { themeId, setThemeId, isDark, toggleDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Homestead Theme Settings</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Choose your workspace palette and lighting profile.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Dark Mode Bar */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Night Roost Mode (Dark)</span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Optimized for early dawn feedings & evening coop checks</p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isDark
                ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-stone-950 font-bold hover:bg-amber-700 shadow-xs'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100'
            }`}
          >
            {isDark ? 'Dark Active' : 'Switch to Dark'}
          </button>
        </div>

        {/* Theme Presets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1">
            Curated Color Presets
          </span>

          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const config = THEMES[id];
            const isSelected = themeId === id;

            return (
              <div
                key={id}
                onClick={() => setThemeId(id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'item-card-selected ring-1 ring-amber-500/50'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/50 dark:hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Swatches pill */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs border border-stone-200/80 dark:border-stone-700 shrink-0"
                    style={{ backgroundColor: config.colors.bgCanvas }}
                  >
                    <div
                      className="w-5 h-5 rounded-lg shadow-xs"
                      style={{ backgroundColor: config.colors.primary }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 item-title">{config.name}</h3>
                      {config.isDark && (
                        <span className="text-[10px] font-semibold bg-stone-800 text-stone-200 px-1.5 py-0.2 rounded-sm border border-stone-700">
                          Dark
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 item-subtext">{config.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Color chips preview */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 dark:border-stone-600"
                      style={{ backgroundColor: config.colors.bgCanvas }}
                      title="Canvas"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 dark:border-stone-600"
                      style={{ backgroundColor: config.colors.bgSubtle }}
                      title="Surface"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: config.colors.primary }}
                      title="Primary Action"
                    />
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-amber-700 dark:bg-amber-500 text-white dark:text-stone-950 font-bold flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-stone-300 dark:border-stone-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 flex items-center justify-between bg-stone-50/50 text-xs text-stone-500">
          <span>Theme preference persists automatically in your browser</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
