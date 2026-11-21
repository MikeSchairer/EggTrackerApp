import React, { useState, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
} from 'lucide-react';
import { AppTabId } from '../types/flock';
import { TAB_CUSTOMIZATION_SCHEMAS } from '../config/tabCustomizationSchema';
import { useCustomization } from '../context/CustomizationContext';

const ALL_TABS: AppTabId[] = [
  'dashboard',
  'eggs',
  'flock',
  'coops',
  'feed',
  'incubation',
  'health',
  'finances',
  'breeds',
  'analytics',
];

export const TabCustomizeModal: React.FC = () => {
  const {
    modalTarget,
    closeCustomizeModal,
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
  } = useCustomization();

  const [selectedTab, setSelectedTab] = useState<AppTabId>('dashboard');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (modalTarget) {
      setSelectedTab(modalTarget.tabId);
      setExpandedSectionId(
        modalTarget.focusSectionId ||
          TAB_CUSTOMIZATION_SCHEMAS[modalTarget.tabId].sections[0]?.id ||
          null
      );
    }
  }, [modalTarget]);

  if (!modalTarget) return null;

  const activeSchema = TAB_CUSTOMIZATION_SCHEMAS[selectedTab];
  const orderedSections = getOrderedSections(selectedTab);

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      reorderSection(selectedTab, draggedIdx, targetIdx);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs"
      onClick={closeCustomizeModal}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 bg-stone-50/60 dark:bg-stone-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                Customize Tabs & Sections
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                Reorder sections, toggle visibility, and choose what information each section shows.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCustomizeModal}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer shrink-0"
            aria-label="Close customization modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector Strip */}
        <div className="px-5 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-950/40 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {ALL_TABS.map((tId) => {
              const tabInfo = TAB_CUSTOMIZATION_SCHEMAS[tId];
              const isActive = selectedTab === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => {
                    setSelectedTab(tId);
                    setExpandedSectionId(TAB_CUSTOMIZATION_SCHEMAS[tId].sections[0]?.id || null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-700 text-white dark:bg-amber-600'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {tabInfo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sections & Inner Details Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pb-1">
            <span>
              <strong className="text-stone-800 dark:text-stone-200">{activeSchema.label}</strong>
              {' · '}
              <span className="font-mono tabular-nums">
                {orderedSections.filter((s) => isSectionVisible(selectedTab, s.id)).length}/{orderedSections.length}
              </span>{' '}
              sections visible
            </span>
            <button
              type="button"
              onClick={() => resetTab(selectedTab)}
              className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset {activeSchema.label}</span>
            </button>
          </div>

          {orderedSections.map((section, idx) => {
            const visible = isSectionVisible(selectedTab, section.id);
            const isExpanded = expandedSectionId === section.id;
            const enabledItemsCount = section.items.filter((item) =>
              isItemVisible(selectedTab, section.id, item.id)
            ).length;
            const isDragTarget = dragOverIdx === idx && draggedIdx !== idx;

            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => setDraggedIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(idx);
                }}
                onDragLeave={() => {
                  if (dragOverIdx === idx) setDragOverIdx(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(idx);
                }}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isDragTarget
                    ? 'border-amber-500 ring-2 ring-amber-500/30'
                    : visible
                    ? 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                    : 'border-stone-200/70 dark:border-stone-800/70 bg-stone-50/80 dark:bg-stone-950/60 opacity-75'
                }`}
              >
                {/* Section Row Header */}
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                    <span
                      className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-grab active:cursor-grabbing shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold ${visible ? 'text-stone-900 dark:text-stone-100' : 'line-through text-stone-400 dark:text-stone-500'}`}>
                          {section.title}
                        </span>
                        <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 tabular-nums">
                          {enabledItemsCount}/{section.items.length} details
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Row Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(selectedTab, section.id, 'up')}
                      className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-35 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === orderedSections.length - 1}
                      onClick={() => moveSection(selectedTab, section.id, 'down')}
                      className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-35 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(selectedTab, section.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                        visible
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{visible ? 'Shown' : 'Hidden'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer whitespace-nowrap"
                    >
                      <span>Details</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Section Information Details Panel */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300">
                        Information shown in {section.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAllSectionItems(selectedTab, section.id, true)}
                          className="text-amber-700 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                        >
                          Show All
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllSectionItems(selectedTab, section.id, false)}
                          className="text-stone-500 dark:text-stone-400 font-semibold hover:underline cursor-pointer"
                        >
                          Hide All
                        </button>
                        <button
                          type="button"
                          onClick={() => resetSection(selectedTab, section.id)}
                          className="text-stone-500 dark:text-stone-400 font-semibold hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {section.items.map((item) => {
                        const checked = isItemVisible(selectedTab, section.id, item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleSectionItem(selectedTab, section.id, item.id)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                              checked
                                ? 'bg-white dark:bg-stone-900 border-amber-300 dark:border-amber-800 text-stone-900 dark:text-stone-100'
                                : 'bg-stone-100/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                                checked
                                  ? 'bg-amber-700 dark:bg-amber-600 border-amber-700 dark:border-amber-600 text-white'
                                  : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className="font-medium truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset section order and details across all tabs to defaults?')) {
                resetAllTabs();
              }
            }}
            className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
          >
            Reset All Tabs
          </button>

          <button
            type="button"
            onClick={closeCustomizeModal}
            className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
