import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 
  | 'rustic-amber' 
  | 'pasture-sage' 
  | 'heritage-terracotta' 
  | 'slate-run' 
  | 'night-roost';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  isDark: boolean;
  colors: {
    primary: string; // e.g. '#B45309'
    primaryHover: string;
    primaryLight: string;
    bgCanvas: string;
    bgCard: string;
    bgSubtle: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accentSwatch: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'rustic-amber': {
    id: 'rustic-amber',
    name: 'Rustic Amber',
    subtitle: 'Classic warm homestead & cedar tones',
    isDark: false,
    colors: {
      primary: '#B45309', // amber-700
      primaryHover: '#92400E', // amber-800
      primaryLight: '#FEF3C7', // amber-100
      bgCanvas: '#FAFAF9', // stone-50
      bgCard: '#FFFFFF',
      bgSubtle: '#F5F5F4', // stone-100
      border: '#E7E5E4', // stone-200
      textPrimary: '#1C1917', // stone-900
      textSecondary: '#78716C', // stone-500
      accentSwatch: '#B45309',
    },
  },
  'pasture-sage': {
    id: 'pasture-sage',
    name: 'Pasture Meadow',
    subtitle: 'Botanical sage green & clover grazing pasture',
    isDark: false,
    colors: {
      primary: '#15803D', // green-700
      primaryHover: '#166534', // green-800
      primaryLight: '#DCFCE7', // green-100
      bgCanvas: '#F4F7F4', // soft sage tinted white
      bgCard: '#FFFFFF',
      bgSubtle: '#EAF0EA',
      border: '#D5DFD5',
      textPrimary: '#142618',
      textSecondary: '#526657',
      accentSwatch: '#15803D',
    },
  },
  'heritage-terracotta': {
    id: 'heritage-terracotta',
    name: 'Heritage Clay',
    subtitle: 'Sun-baked terracotta & autumn barn timbers',
    isDark: false,
    colors: {
      primary: '#C2410C', // orange-700
      primaryHover: '#9A3412', // orange-800
      primaryLight: '#FFEDD5', // orange-100
      bgCanvas: '#FAF7F5', // warm clay white
      bgCard: '#FFFFFF',
      bgSubtle: '#F5EFEB',
      border: '#E8DDD6',
      textPrimary: '#2A1810',
      textSecondary: '#785A4E',
      accentSwatch: '#C2410C',
    },
  },
  'slate-run': {
    id: 'slate-run',
    name: 'Coastal Slate',
    subtitle: 'Cool Nordic morning mist & steel paddock wire',
    isDark: false,
    colors: {
      primary: '#0369A1', // sky-700
      primaryHover: '#075985', // sky-800
      primaryLight: '#E0F2FE', // sky-100
      bgCanvas: '#F8FAFC', // slate-50
      bgCard: '#FFFFFF',
      bgSubtle: '#F1F5F9', // slate-100
      border: '#E2E8F0', // slate-200
      textPrimary: '#0F172A', // slate-900
      textSecondary: '#64748B', // slate-500
      accentSwatch: '#0284C7',
    },
  },
  'night-roost': {
    id: 'night-roost',
    name: 'Night Roost',
    subtitle: 'Low-light dark theme for dawn & evening inspections',
    isDark: true,
    colors: {
      primary: '#D97706', // amber-600
      primaryHover: '#B45309', // amber-700
      primaryLight: '#451A03', // dark amber
      bgCanvas: '#0C0A09', // stone-950
      bgCard: '#1C1917', // stone-900
      bgSubtle: '#292524', // stone-800
      border: '#44403C', // stone-700
      textPrimary: '#FAFAF9', // stone-50
      textSecondary: '#A8A29E', // stone-400
      accentSwatch: '#D97706',
    },
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const THEME_STORAGE_KEY = 'cluck_and_clutch_theme_id';

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES['rustic-amber'],
  themeId: 'rustic-amber',
  setThemeId: () => {},
  isDark: false,
  toggleDarkMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch (e) {
      // Fallback
    }
    return 'rustic-amber';
  });

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch (e) {
      console.error('Failed to store theme preference', e);
    }
  };

  const toggleDarkMode = () => {
    if (themeId === 'night-roost') {
      setThemeId('rustic-amber');
    } else {
      setThemeId('night-roost');
    }
  };

  const currentTheme = THEMES[themeId] || THEMES['rustic-amber'];

  // Apply root variables and class
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);
    if (currentTheme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS custom variables for dynamic styling
    root.style.setProperty('--theme-primary', currentTheme.colors.primary);
    root.style.setProperty('--theme-primary-hover', currentTheme.colors.primaryHover);
    root.style.setProperty('--theme-primary-light', currentTheme.colors.primaryLight);
    root.style.setProperty('--theme-bg-canvas', currentTheme.colors.bgCanvas);
    root.style.setProperty('--theme-bg-card', currentTheme.colors.bgCard);
    root.style.setProperty('--theme-bg-subtle', currentTheme.colors.bgSubtle);
    root.style.setProperty('--theme-border', currentTheme.colors.border);
    root.style.setProperty('--theme-text-primary', currentTheme.colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', currentTheme.colors.textSecondary);
  }, [themeId, currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        themeId,
        setThemeId,
        isDark: currentTheme.isDark,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
