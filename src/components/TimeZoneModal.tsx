import React, { useState, useMemo, useEffect } from 'react';
import { X, Globe, Clock, Check, Search, Sparkles, AlertCircle } from 'lucide-react';
import { 
  POPULAR_TIMEZONES, 
  getTimeZone, 
  setTimeZone as persistTimeZone, 
  getCurrentDateTimePreview,
  isValidTimeZone
} from '../utils/dateUtils';

interface TimeZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimeZone: string;
  onSaveTimeZone: (newTimeZone: string) => void;
}

export const TimeZoneModal: React.FC<TimeZoneModalProps> = ({
  isOpen,
  onClose,
  currentTimeZone,
  onSaveTimeZone,
}) => {
  const [selectedTz, setSelectedTz] = useState<string>(currentTimeZone);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tick, setTick] = useState<number>(0);

  // Update clock preview every second while open
  useEffect(() => {
    if (!isOpen) return;
    setSelectedTz(currentTimeZone || getTimeZone());
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentTimeZone]);

  const activePreview = useMemo(() => {
    return getCurrentDateTimePreview(selectedTz);
  }, [selectedTz, tick]);

  const currentSavedPreview = useMemo(() => {
    return getCurrentDateTimePreview(currentTimeZone);
  }, [currentTimeZone, tick]);

  const detectedTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'America/Los_Angeles';
    }
  }, []);

  const filteredTimezones = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return POPULAR_TIMEZONES;
    return POPULAR_TIMEZONES.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (tz: string) => {
    setSelectedTz(tz);
  };

  const handleAutoDetect = () => {
    if (detectedTz && isValidTimeZone(detectedTz)) {
      setSelectedTz(detectedTz);
    }
  };

  const handleSave = () => {
    persistTimeZone(selectedTz);
    onSaveTimeZone(selectedTz);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Homestead Time Zone</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Settings
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Fix day-rollover issues so today's egg counts and chores match your local calendar day.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Active Preview Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-stone-50 dark:via-stone-900 to-amber-700/10 border border-amber-300/80 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Selected Time Zone Preview</span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200">
                {activePreview.timeZoneName}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pt-1">
              <div>
                <span className="text-lg font-bold text-stone-900 dark:text-stone-100 block">
                  {activePreview.readableDate}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  Calendar Date Key: <strong className="text-amber-800 dark:text-amber-300">{activePreview.dateStr}</strong>
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xl font-mono font-extrabold text-amber-700 dark:text-amber-400">
                  {activePreview.readableTime}
                </span>
              </div>
            </div>

            {selectedTz !== currentTimeZone && (
              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                Notice: Changing to this timezone will display today's egg counts and reminders for{' '}
                <strong className="underline">{activePreview.dateStr}</strong> instead of {currentSavedPreview.dateStr}.
              </p>
            )}
          </div>

          {/* Auto-detect button */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAutoDetect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-950/70 hover:bg-amber-200/70 dark:hover:bg-amber-900/80 rounded-lg transition-colors cursor-pointer border border-amber-200 dark:border-amber-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Auto-Detect Browser Time Zone ({detectedTz})</span>
            </button>

            <span className="text-[11px] text-stone-400">
              {filteredTimezones.length} options
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, state, or region (e.g., Pacific, Los Angeles, Chicago)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Time zone list */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {filteredTimezones.map((tz) => {
              const isSelected = selectedTz === tz.value;
              const preview = getCurrentDateTimePreview(tz.value);

              return (
                <div
                  key={tz.value}
                  onClick={() => handleSelect(tz.value)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 ring-1 ring-amber-500'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-300 dark:hover:border-stone-700 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{tz.label}</span>
                      {tz.value === detectedTz && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          Detected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                      <span className="font-mono text-stone-400">{tz.value}</span>
                      <span>·</span>
                      <span>Date: <strong className="font-mono text-stone-700 dark:text-stone-300">{preview.dateStr}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100 block">
                        {preview.readableTime}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTimezones.length === 0 && (
              <div className="p-6 text-center text-xs text-stone-500">
                No timezones found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply & Save Time Zone</span>
          </button>
        </div>
      </div>
    </div>
  );
};
