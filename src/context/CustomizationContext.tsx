import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppTabId, TabCustomizationState, TabLayoutConfig } from '../types/flock';
import {
  TAB_CUSTOMIZATION_SCHEMAS,
  getDefaultTabLayout,
  normalizeTabLayout,
  SectionSchema,
} from '../config/tabCustomizationSchema';

const STORAGE_KEY = 'flocker_tab_customization_v1';

interface CustomizationModalTarget {
  tabId: AppTabId;
  focusSectionId?: string;
}

interface CustomizationContextValue {
  customization: TabCustomizationState;
  editModeTab: AppTabId | null;
  setEditModeTab: (tabId: AppTabId | null) => void;
  toggleEditMode: (tabId: AppTabId) => void;
  modalTarget: CustomizationModalTarget | null;
  openCustomizeModal: (tabId: AppTabId, focusSectionId?: string) => void;
  closeCustomizeModal: () => void;
  getTabLayout: (tabId: AppTabId) => TabLayoutConfig;
  getOrderedSections: (tabId: AppTabId) => SectionSchema[];
  isSectionVisible: (tabId: AppTabId, sectionId: string) => boolean;
  isItemVisible: (tabId: AppTabId, sectionId: string, itemId: string) => boolean;
  toggleSectionVisibility: (tabId: AppTabId, sectionId: string) => void;
  moveSection: (tabId: AppTabId, sectionId: string, direction: 'up' | 'down') => void;
  reorderSection: (tabId: AppTabId, fromIndex: number, toIndex: number) => void;
  toggleSectionItem: (tabId: AppTabId, sectionId: string, itemId: string) => void;
  setAllSectionItems: (tabId: AppTabId, sectionId: string, visible: boolean) => void;
  resetSection: (tabId: AppTabId, sectionId: string) => void;
  resetTab: (tabId: AppTabId) => void;
  resetAllTabs: () => void;
  replaceCustomization: (next: TabCustomizationState) => void;
}

const CustomizationContext = createContext<CustomizationContextValue | undefined>(undefined);

interface CustomizationProviderProps {
  children: React.ReactNode;
  externalCustomization?: TabCustomizationState;
  onSyncCustomization?: (next: TabCustomizationState) => void;
}

export const CustomizationProvider: React.FC<CustomizationProviderProps> = ({
  children,
  externalCustomization,
  onSyncCustomization,
}) => {
  const [customization, setCustomization] = useState<TabCustomizationState>(() => {
    if (externalCustomization && Object.keys(externalCustomization).length > 0) {
      return externalCustomization;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editModeTab, setEditModeTab] = useState<AppTabId | null>(null);
  const [modalTarget, setModalTarget] = useState<CustomizationModalTarget | null>(null);

  // Sync from external state (e.g. after Firestore cloud load) when it changes meaningfully
  useEffect(() => {
    if (externalCustomization) {
      setCustomization((prev) => {
        const prevStr = JSON.stringify(prev);
        const extStr = JSON.stringify(externalCustomization);
        if (prevStr !== extStr && Object.keys(externalCustomization).length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, extStr);
          } catch {}
          return externalCustomization;
        }
        return prev;
      });
    }
  }, [externalCustomization]);

  const updateAndPersist = useCallback(
    (updater: (prev: TabCustomizationState) => TabCustomizationState) => {
      setCustomization((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        if (onSyncCustomization) {
          onSyncCustomization(next);
        }
        return next;
      });
    },
    [onSyncCustomization]
  );

  const getTabLayout = useCallback(
    (tabId: AppTabId): TabLayoutConfig => {
      return normalizeTabLayout(tabId, customization[tabId]);
    },
    [customization]
  );

  const getOrderedSections = useCallback(
    (tabId: AppTabId): SectionSchema[] => {
      const layout = getTabLayout(tabId);
      const schemaMap = new Map(
        TAB_CUSTOMIZATION_SCHEMAS[tabId].sections.map((s) => [s.id, s])
      );
      return layout.sectionOrder
        .map((id) => schemaMap.get(id))
        .filter((s): s is SectionSchema => Boolean(s));
    },
    [getTabLayout]
  );

  const isSectionVisible = useCallback(
    (tabId: AppTabId, sectionId: string): boolean => {
      const layout = getTabLayout(tabId);
      return !layout.hiddenSections.includes(sectionId);
    },
    [getTabLayout]
  );

  const isItemVisible = useCallback(
    (tabId: AppTabId, sectionId: string, itemId: string): boolean => {
      const layout = getTabLayout(tabId);
      const sectionItems = layout.sectionItems[sectionId];
      if (!sectionItems || typeof sectionItems[itemId] !== 'boolean') {
        return true;
      }
      return sectionItems[itemId];
    },
    [getTabLayout]
  );

  const toggleSectionVisibility = useCallback(
    (tabId: AppTabId, sectionId: string) => {
      updateAndPersist((prev) => {
        const current = normalizeTabLayout(tabId, prev[tabId]);
        const isHidden = current.hiddenSections.includes(sectionId);
        const hiddenSections = isHidden
          ? current.hiddenSections.filter((id) => id !== sectionId)
          : [...current.hiddenSections, sectionId];
        return {
          ...prev,
          [tabId]: {
            ...current,
            hiddenSections,
          },
        };
      });
    },
    [updateAndPersist]
  );

  const moveSection = useCallback(
    (tabId: AppTabId, sectionId: string, direction: 'up' | 'down') => {
      updateAndPersist((prev) => {
        const current = normalizeTabLayout(tabId, prev[tabId]);
        const order = [...current.sectionOrder];
        const idx = order.indexOf(sectionId);
        if (idx === -1) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= order.length) return prev;
        const [moved] = order.splice(idx, 1);
        order.splice(targetIdx, 0, moved);
        return {
          ...prev,
          [tabId]: {
            ...current,
            sectionOrder: order,
          },
        };
      });
    },
    [updateAndPersist]
  );

  const reorderSection = useCallback(
    (tabId: AppTabId, fromIndex: number, toIndex: number) => {
      updateAndPersist((prev) => {
        const current = normalizeTabLayout(tabId, prev[tabId]);
        const order = [...current.sectionOrder];
        if (
          fromIndex < 0 ||
          fromIndex >= order.length ||
          toIndex < 0 ||
          toIndex >= order.length ||
          fromIndex === toIndex
        ) {
          return prev;
        }
        const [moved] = order.splice(fromIndex, 1);
        order.splice(toIndex, 0, moved);
        return {
          ...prev,
          [tabId]: {
            ...current,
            sectionOrder: order,
          },
        };
      });
    },
    [updateAndPersist]
  );

  const toggleSectionItem = useCallback(
    (tabId: AppTabId, sectionId: string, itemId: string) => {
      updateAndPersist((prev) => {
        const current = normalizeTabLayout(tabId, prev[tabId]);
        const prevVal = current.sectionItems[sectionId]?.[itemId] ?? true;
        return {
          ...prev,
          [tabId]: {
            ...current,
            sectionItems: {
              ...current.sectionItems,
              [sectionId]: {
                ...(current.sectionItems[sectionId] || {}),
                [itemId]: !prevVal,
              },
            },
          },
        };
      });
    },
    [updateAndPersist]
  );

  const setAllSectionItems = useCallback(
    (tabId: AppTabId, sectionId: string, visible: boolean) => {
      updateAndPersist((prev) => {
        const current = normalizeTabLayout(tabId, prev[tabId]);
        const sectionSchema = TAB_CUSTOMIZATION_SCHEMAS[tabId].sections.find(
          (s) => s.id === sectionId
        );
        if (!sectionSchema) return prev;
        const updatedItems: Record<string, boolean> = {};
        sectionSchema.items.forEach((item) => {
          updatedItems[item.id] = visible;
        });
        return {
          ...prev,
          [tabId]: {
            ...current,
            sectionItems: {
              ...current.sectionItems,
              [sectionId]: updatedItems,
            },
          },
        };
      });
    },
    [updateAndPersist]
  );

  const resetSection = useCallback(
    (tabId: AppTabId, sectionId: string) => {
      updateAndPersist((prev) => {
        const current = normalizeTabLayout(tabId, prev[tabId]);
        const defaults = getDefaultTabLayout(tabId);
        return {
          ...prev,
          [tabId]: {
            ...current,
            hiddenSections: current.hiddenSections.filter((id) => id !== sectionId),
            sectionItems: {
              ...current.sectionItems,
              [sectionId]: { ...(defaults.sectionItems[sectionId] || {}) },
            },
          },
        };
      });
    },
    [updateAndPersist]
  );

  const resetTab = useCallback(
    (tabId: AppTabId) => {
      updateAndPersist((prev) => {
        const next = { ...prev };
        next[tabId] = getDefaultTabLayout(tabId);
        return next;
      });
    },
    [updateAndPersist]
  );

  const resetAllTabs = useCallback(() => {
    updateAndPersist(() => ({}));
  }, [updateAndPersist]);

  const replaceCustomization = useCallback((next: TabCustomizationState) => {
    setCustomization(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const toggleEditMode = useCallback((tabId: AppTabId) => {
    setEditModeTab((prev) => (prev === tabId ? null : tabId));
  }, []);

  const openCustomizeModal = useCallback((tabId: AppTabId, focusSectionId?: string) => {
    setModalTarget({ tabId, focusSectionId });
  }, []);

  const closeCustomizeModal = useCallback(() => {
    setModalTarget(null);
  }, []);

  return (
    <CustomizationContext.Provider
      value={{
        customization,
        editModeTab,
        setEditModeTab,
        toggleEditMode,
        modalTarget,
        openCustomizeModal,
        closeCustomizeModal,
        getTabLayout,
        getOrderedSections,
        isSectionVisible,
        isItemVisible,
        toggleSectionVisibility,
        moveSection,
        reorderSection,
        toggleSectionItem,
        setAllSectionItems,
        resetSection,
        resetTab,
        resetAllTabs,
        replaceCustomization,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export function useCustomization(): CustomizationContextValue {
  const ctx = useContext(CustomizationContext);
  if (!ctx) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return ctx;
}
