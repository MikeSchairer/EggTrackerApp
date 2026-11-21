import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  RotateCcw,
  Settings2,
} from 'lucide-react';
import { AppTabId } from '../types/flock';
import { TAB_CUSTOMIZATION_SCHEMAS } from '../config/tabCustomizationSchema';
import { useCustomization } from '../context/CustomizationContext';

interface TabCustomizeControlsProps {
  tabId: AppTabId;
}

export const TabCustomizeControls: React.FC<TabCustomizeControlsProps> = ({ tabId }) => {
  const { editModeTab, toggleEditMode, openCustomizeModal, getTabLayout } = useCustomization();
  const isEditing = editModeTab === tabId;
  const layout = getTabLayout(tabId);
  const hiddenCount = layout.hiddenSections.length;

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={() => toggleEditMode(tabId)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          isEditing
            ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-600 dark:border-amber-600 shadow-xs'
            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
        }`}
        title={isEditing ? 'Finish reordering sections' : 'Reorder, hide, or configure sections directly on this tab'}
      >
        {isEditing ? <Check className="w-3.5 h-3.5" /> : <GripVertical className="w-3.5 h-3.5 text-stone-400" />}
        <span>{isEditing ? 'Done Editing' : 'Edit Layout'}</span>
      </button>

      <button
        type="button"
        onClick={() => openCustomizeModal(tabId)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Customize sections and details shown in this tab"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        <span>Customize</span>
        {hiddenCount > 0 && (
          <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
            · {hiddenCount} hidden
          </span>
        )}
      </button>
    </div>
  );
};

interface CustomizableSectionListProps {
  tabId: AppTabId;
  renderSection: (sectionId: string) => React.ReactNode;
  className?: string;
}

export const CustomizableSectionList: React.FC<CustomizableSectionListProps> = ({
  tabId,
  renderSection,
  className = 'space-y-6',
}) => {
  const {
    editModeTab,
    getOrderedSections,
    isSectionVisible,
    isItemVisible,
    toggleSectionVisibility,
    moveSection,
    reorderSection,
    openCustomizeModal,
    resetTab,
  } = useCustomization();

  const isEditing = editModeTab === tabId;
  const orderedSections = getOrderedSections(tabId);
  const visibleSections = orderedSections.filter((s) => isSectionVisible(tabId, s.id));
  const hiddenSections = orderedSections.filter((s) => !isSectionVisible(tabId, s.id));

  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  const handleDrop = (targetSectionId: string) => {
    if (!draggedSectionId || draggedSectionId === targetSectionId) {
      setDraggedSectionId(null);
      setDragOverSectionId(null);
      return;
    }
    const fromIdx = orderedSections.findIndex((s) => s.id === draggedSectionId);
    const toIdx = orderedSections.findIndex((s) => s.id === targetSectionId);
    if (fromIdx !== -1 && toIdx !== -1) {
      reorderSection(tabId, fromIdx, toIdx);
    }
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  return (
    <div className={className}>
      {isEditing && (
        <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-stone-900 dark:text-stone-100">
              Editing {TAB_CUSTOMIZATION_SCHEMAS[tabId].label} Layout
            </p>
            <p className="text-stone-600 dark:text-stone-400">
              Drag sections or use the arrows to reorder, hide sections you do not need, or customize the information shown inside each section.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openCustomizeModal(tabId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer whitespace-nowrap"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>All Options</span>
            </button>
            <button
              type="button"
              onClick={() => resetTab(tabId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Tab</span>
            </button>
          </div>
        </div>
      )}

      {visibleSections.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl space-y-3">
          <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
            All sections in {TAB_CUSTOMIZATION_SCHEMAS[tabId].label} are currently hidden.
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Re-enable one or more sections from the customization drawer or reset this tab to default.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => openCustomizeModal(tabId)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize Sections</span>
            </button>
            <button
              type="button"
              onClick={() => resetTab(tabId)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          </div>
        </div>
      ) : (
        visibleSections.map((section, visibleIndex) => {
          const content = renderSection(section.id);
          if (content === null || content === undefined) return null;

          const enabledCount = section.items.filter((item) =>
            isItemVisible(tabId, section.id, item.id)
          ).length;

          if (!isEditing) {
            return <React.Fragment key={section.id}>{content}</React.Fragment>;
          }

          const isDragOver = dragOverSectionId === section.id && draggedSectionId !== section.id;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => setDraggedSectionId(section.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverSectionId(section.id);
              }}
              onDragLeave={() => {
                if (dragOverSectionId === section.id) setDragOverSectionId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(section.id);
              }}
              onDragEnd={() => {
                setDraggedSectionId(null);
                setDragOverSectionId(null);
              }}
              className={`rounded-2xl border transition-all p-3 space-y-3 ${
                isDragOver
                  ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-500/40'
                  : 'border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-grab active:cursor-grabbing"
                    title="Drag to reorder section"
                  >
                    <GripVertical className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {section.title}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 tabular-nums">
                    · {enabledCount}/{section.items.length} details
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    disabled={visibleIndex === 0}
                    onClick={() => moveSection(tabId, section.id, 'up')}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-35 cursor-pointer"
                    title="Move section up"
                    aria-label={`Move ${section.title} up`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={visibleIndex === visibleSections.length - 1}
                    onClick={() => moveSection(tabId, section.id, 'down')}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-35 cursor-pointer"
                    title="Move section down"
                    aria-label={`Move ${section.title} down`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openCustomizeModal(tabId, section.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>Customize Section</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(tabId, section.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer whitespace-nowrap"
                    title="Hide this section"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </button>
                </div>
              </div>

              <div>{content}</div>
            </div>
          );
        })
      )}

      {hiddenSections.length > 0 && isEditing && (
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            Hidden Sections ({hiddenSections.length})
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {hiddenSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => toggleSectionVisibility(tabId, section.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:border-amber-500 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Show {section.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
