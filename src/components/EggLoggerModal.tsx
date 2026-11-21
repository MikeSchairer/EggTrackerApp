import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Sparkles, Edit3 } from 'lucide-react';
import { Coop, Chicken, EggItem, EggLog, EggSize, EggColor, EggShape, EggCondition } from '../types/flock';
import { EGG_SIZES, EGG_COLORS, EGG_SHAPES, CHICKEN_BREEDS } from '../data/breeds';
import { EggVisual } from './EggVisual';
import { getTodayDateStr, getCurrentTimeStr } from '../utils/dateUtils';

interface EggLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: EggLog) => void;
  coops: Coop[];
  chickens: Chicken[];
  defaultCoopId?: string;
  initialLog?: EggLog | null;
  timezone?: string;
}

export const getEggSizeFromWeight = (weightGrams: number): EggSize => {
  if (weightGrams <= 34) return 'peewee';
  if (weightGrams <= 42) return 'small';
  if (weightGrams <= 49) return 'medium';
  if (weightGrams <= 56) return 'large';
  if (weightGrams <= 63) return 'extra_large';
  return 'jumbo';
};

export const EggLoggerModal: React.FC<EggLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  coops,
  chickens,
  defaultCoopId,
  initialLog,
  timezone,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(() => initialLog?.date || getTodayDateStr(timezone));
  const [time, setTime] = useState<string>(() => initialLog?.time || getCurrentTimeStr(timezone));
  const [coopId, setCoopId] = useState<string>(() => initialLog?.coopId || (defaultCoopId && defaultCoopId !== 'all' ? defaultCoopId : coops[0]?.id || 'main-coop'));
  const [weather, setWeather] = useState<'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Cold Snap' | 'Heatwave'>(() => initialLog?.weather || 'Sunny');
  const [notes, setNotes] = useState<string>(() => initialLog?.notes || '');
  const [mode, setMode] = useState<'individual' | 'quick'>(() => (initialLog?.eggs && initialLog.eggs.length > 0 ? 'individual' : 'quick'));

  // Quick mode count
  const [quickCount, setQuickCount] = useState<number>(() => initialLog?.totalEggs || 1);
  const [quickBroken, setQuickBroken] = useState<number>(() => initialLog?.brokenCount || 0);

  // Helper to extract default egg color and size from a chicken's profile, falling back to breed
  const getHenDefaultEggColor = (hen: Chicken | undefined): EggColor => {
    if (!hen) return 'terracotta_brown';
    if (hen.defaultEggColor) return hen.defaultEggColor;
    const breed = CHICKEN_BREEDS.find(b => b.id === hen.breedId);
    return breed?.eggColorType || 'terracotta_brown';
  };

  const getHenDefaultEggSize = (hen: Chicken | undefined): EggSize => {
    if (!hen) return 'large';
    const breed = CHICKEN_BREEDS.find(b => b.id === hen.breedId);
    return breed?.expectedEggSize || 'large';
  };

  // Individual egg items
  const coopHens = chickens.filter(c => c.coopId === coopId && c.gender === 'hen');
  const otherCoopHens = chickens.filter(c => c.coopId !== coopId && c.gender === 'hen');
  const coopLayingHens = coopHens.filter(c => c.lifeStage === 'active_layer');

  const [eggs, setEggs] = useState<EggItem[]>(() => {
    if (initialLog?.eggs && initialLog.eggs.length > 0) {
      return initialLog.eggs;
    }
    const firstHen = coopLayingHens[0] || coopHens[0];
    const initialSize = getHenDefaultEggSize(firstHen);
    const sizeMeta = EGG_SIZES.find(s => s.id === initialSize);
    const initialWeight = sizeMeta?.sampleGrams || 54;
    return [
      {
        id: `egg-${Date.now()}-1`,
        size: initialSize,
        color: getHenDefaultEggColor(firstHen),
        shape: 'classic_oval',
        weightGrams: initialWeight,
        condition: 'clean_intact',
        chickenId: firstHen?.id || '',
      },
    ];
  });

  // Re-sync when initialLog or isOpen changes
  useEffect(() => {
    if (initialLog) {
      setDate(initialLog.date);
      setTime(initialLog.time || getCurrentTimeStr(timezone));
      setCoopId(initialLog.coopId);
      setWeather(initialLog.weather || 'Sunny');
      setNotes(initialLog.notes || '');
      setQuickCount(initialLog.totalEggs);
      setQuickBroken(initialLog.brokenCount);
      if (initialLog.eggs && initialLog.eggs.length > 0) {
        setEggs(initialLog.eggs);
        setMode('individual');
      } else {
        setMode('quick');
      }
    } else {
      const activeCoopId = defaultCoopId && defaultCoopId !== 'all' ? defaultCoopId : coops[0]?.id || 'main-coop';
      const firstHen =
        chickens.find(c => c.coopId === activeCoopId && c.gender === 'hen' && c.lifeStage === 'active_layer') ||
        chickens.find(c => c.coopId === activeCoopId && c.gender === 'hen');
      const initialSize = getHenDefaultEggSize(firstHen);
      const sizeMeta = EGG_SIZES.find(s => s.id === initialSize);
      setDate(getTodayDateStr(timezone));
      setTime(getCurrentTimeStr(timezone));
      setCoopId(activeCoopId);
      setWeather('Sunny');
      setNotes('');
      setMode('quick');
      setQuickCount(1);
      setQuickBroken(0);
      setEggs([
        {
          id: `egg-${Date.now()}-1`,
          size: initialSize,
          color: getHenDefaultEggColor(firstHen),
          shape: 'classic_oval',
          weightGrams: sizeMeta?.sampleGrams || 54,
          condition: 'clean_intact',
          chickenId: firstHen?.id || '',
        },
      ]);
    }
  }, [isOpen, initialLog, defaultCoopId, coops, chickens, timezone]);

  const handleAddEgg = () => {
    // Default to laying hen's expected egg color and size from profile if available
    const preferredPool = coopLayingHens.length > 0 ? coopLayingHens : coopHens;
    const nextHen = preferredPool[eggs.length % (preferredPool.length || 1)];
    const defaultColor = getHenDefaultEggColor(nextHen);
    const defaultSize = getHenDefaultEggSize(nextHen);
    const sizeMeta = EGG_SIZES.find(s => s.id === defaultSize);

    setEggs(prev => [
      ...prev,
      {
        id: `egg-${Date.now()}-${prev.length + 1}`,
        size: defaultSize,
        color: defaultColor,
        shape: 'classic_oval',
        weightGrams: sizeMeta?.sampleGrams || 54,
        condition: 'clean_intact',
        chickenId: nextHen?.id || '',
      },
    ]);
  };

  const handleRemoveEgg = (index: number) => {
    setEggs(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateEgg = (index: number, updates: Partial<EggItem>) => {
    setEggs(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, ...updates };
      // If chicken selected or changed, auto-apply the hen's default egg color from their profile!
      if (updates.chickenId !== undefined) {
        if (updates.chickenId) {
          const hen = chickens.find(c => c.id === updates.chickenId);
          if (hen) {
            updated.color = getHenDefaultEggColor(hen);
            const autoSize = getHenDefaultEggSize(hen);
            updated.size = autoSize;
            const sizeMeta = EGG_SIZES.find(s => s.id === autoSize);
            if (sizeMeta && !updates.weightGrams) {
              updated.weightGrams = sizeMeta.sampleGrams;
            }
          }
        }
      }
      return updated;
    }));
  };

  // Dedicated weight stepper updater that automatically recalibrates Size Grade
  const handleWeightChange = (index: number, newWeight: number) => {
    const clamped = Math.max(20, Math.min(99, Math.round(newWeight)));
    const autoSize = getEggSizeFromWeight(clamped);
    handleUpdateEgg(index, {
      weightGrams: clamped,
      size: autoSize,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalEggs: EggItem[] = [];
    let broken = 0;

    if (mode === 'quick') {
      broken = quickBroken;
      // Auto generate egg items from coop hens or standard distribution
      for (let i = 0; i < quickCount; i++) {
        const hen = coopHens[i % (coopHens.length || 1)];
        const color = getHenDefaultEggColor(hen);
        const size = getHenDefaultEggSize(hen);
        finalEggs.push({
          id: `egg-${Date.now()}-${i}`,
          size,
          color,
          shape: 'classic_oval',
          weightGrams: 53 + (i % 5),
          condition: i < quickBroken ? 'hairline_crack' : 'clean_intact',
          chickenId: hen?.id,
        });
      }
    } else {
      finalEggs = eggs;
      broken = eggs.filter(e => e.condition === 'hairline_crack' || e.condition === 'soft_shell').length;
    }

    const log: EggLog = {
      id: initialLog ? initialLog.id : `log-${Date.now()}`,
      date,
      time,
      coopId,
      totalEggs: finalEggs.length,
      brokenCount: broken,
      eggs: finalEggs,
      weather,
      notes: notes.trim() || undefined,
    };

    onSaveLog(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 transition-colors">
        
        {/* Compact Header */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              {initialLog ? <Edit3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                {initialLog ? 'Edit Egg Collection Entry' : 'Log Daily Egg Collection'}
              </h2>
              <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                Record harvest yield, shell attributes, and coop conditions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Compact & Mobile Friendly */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-3.5 py-3 sm:px-5 sm:py-3.5 space-y-3">
          
          {/* Top metadata grid: 2 cols on mobile, 4 cols on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-amber-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-amber-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Coop Location</label>
              <select
                value={coopId}
                onChange={e => setCoopId(e.target.value)}
                required
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-amber-600 transition-colors truncate"
              >
                {coops.length === 0 ? (
                  <option value="main-coop">Main Coop</option>
                ) : (
                  coops.map(coop => (
                    <option key={coop.id} value={coop.id}>
                      {coop.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Weather Context</label>
              <select
                value={weather}
                onChange={e => setWeather(e.target.value as any)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-amber-600 transition-colors truncate"
              >
                <option value="Sunny">Sunny / Mild</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Rainy">Overcast / Rain</option>
                <option value="Cold Snap">Cold Snap (&lt;35°F)</option>
                <option value="Heatwave">Heatwave (&gt;88°F)</option>
              </select>
            </div>
          </div>

          {/* Entry Method Switcher */}
          <div>
            <div className="flex rounded-lg border border-stone-200 dark:border-stone-700 p-0.5 bg-stone-100 dark:bg-stone-800">
              <button
                type="button"
                onClick={() => setMode('individual')}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  mode === 'individual' 
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Per-Egg Details ({eggs.length})
              </button>
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  mode === 'quick' 
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Quick Batch Count
              </button>
            </div>
          </div>

          {/* Quick Count Mode */}
          {mode === 'quick' ? (
            <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Total Eggs Collected</span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Fast batch logging for routine collections</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickCount(Math.max(1, quickCount - 1))}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-bold text-amber-700 dark:text-amber-400 w-8 text-center tabular-nums">
                    {quickCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickCount(quickCount + 1)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Cracked / Damaged Shells</span>
                  <p className="text-[10px] text-stone-400">Logged for shell quality analytics</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickBroken(Math.max(0, quickBroken - 1))}
                    className="w-6 h-6 rounded-md bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-semibold text-stone-800 dark:text-stone-200 w-6 text-center tabular-nums">
                    {quickBroken}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickBroken(Math.min(quickCount, quickBroken + 1))}
                    className="w-6 h-6 rounded-md bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Individual Egg Inspection Mode */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Individual Eggs ({eggs.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddEgg}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Egg</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[46vh] sm:max-h-[380px] overflow-y-auto pr-1">
                {eggs.map((egg, index) => {
                  const currentSizeMeta = EGG_SIZES.find(s => s.id === egg.size);
                  return (
                    <div
                      key={egg.id}
                      className="p-2.5 sm:p-3 bg-stone-50/90 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700/80 rounded-xl space-y-2 transition-colors"
                    >
                      {/* Compact Item Header */}
                      <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-200/60 dark:border-stone-700/50">
                        <div className="flex items-center gap-2">
                          <EggVisual color={egg.color} shape={egg.shape} size={egg.size} className="w-6 h-8" />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Egg #{index + 1}</span>
                            <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                              {egg.weightGrams ? `${egg.weightGrams}g` : '54g'} · {currentSizeMeta?.label || 'Large'}
                            </span>
                          </div>
                        </div>

                        {eggs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEgg(index)}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                            title="Remove egg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Primary Attributes Grid: Color, Shape, Weight (Number Selector), Size Grade */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {/* 1. Shell Color */}
                        <div>
                          <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 block mb-0.5">Shell Color</label>
                          <select
                            value={egg.color}
                            onChange={e => handleUpdateEgg(index, { color: e.target.value as EggColor })}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
                          >
                            {EGG_COLORS.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Shell Shape */}
                        <div>
                          <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 block mb-0.5">Shell Shape</label>
                          <select
                            value={egg.shape}
                            onChange={e => handleUpdateEgg(index, { shape: e.target.value as EggShape })}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
                          >
                            {EGG_SHAPES.map(sh => (
                              <option key={sh.id} value={sh.id}>{sh.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Weight Number Selector (No manual typing required) */}
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 block">Weight</label>
                            <span className="text-[9px] text-amber-700 dark:text-amber-400 font-mono font-medium">auto-sync</span>
                          </div>
                          <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden shadow-xs h-[30px]">
                            <button
                              type="button"
                              onClick={() => handleWeightChange(index, (egg.weightGrams || 54) - 1)}
                              className="w-7 h-full flex items-center justify-center bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs select-none cursor-pointer active:scale-95 transition-transform"
                              title="Decrease 1g"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-mono font-bold text-xs text-stone-900 dark:text-stone-100 tabular-nums px-1">
                              {egg.weightGrams || 54}g
                            </span>
                            <button
                              type="button"
                              onClick={() => handleWeightChange(index, (egg.weightGrams || 54) + 1)}
                              className="w-7 h-full flex items-center justify-center bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs select-none cursor-pointer active:scale-95 transition-transform"
                              title="Increase 1g"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* 4. Size Grade (Automatically updates when weight changes, but selectable as well) */}
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 block">Size Grade</label>
                          </div>
                          <select
                            value={egg.size}
                            onChange={e => {
                              const newSize = e.target.value as EggSize;
                              const sizeMeta = EGG_SIZES.find(s => s.id === newSize);
                              handleUpdateEgg(index, {
                                size: newSize,
                                weightGrams: sizeMeta?.sampleGrams || egg.weightGrams,
                              });
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
                          >
                            {EGG_SIZES.map(s => (
                              <option key={s.id} value={s.id}>{s.label} ({s.minWeight}-{s.maxWeight}g)</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Quick weight presets for fast mobile tapping */}
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                        <span className="text-[9px] text-stone-400 shrink-0 mr-0.5">Presets:</span>
                        {[
                          { label: 'Sm 39g', grams: 39 },
                          { label: 'Med 46g', grams: 46 },
                          { label: 'Lrg 53g', grams: 53 },
                          { label: 'XL 60g', grams: 60 },
                          { label: 'Jumbo 68g', grams: 68 },
                        ].map(preset => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleWeightChange(index, preset.grams)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 cursor-pointer transition-colors ${
                              egg.weightGrams === preset.grams
                                ? 'bg-amber-600 text-white font-bold'
                                : 'bg-stone-200/70 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Secondary Attributes Grid: Layer Bird & Shell Condition */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                        {/* Layer Hen Attribution */}
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 block">
                              Layer Bird (Optional)
                            </label>
                            {egg.chickenId && (
                              <span className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">
                                Profile synced
                              </span>
                            )}
                          </div>
                          <select
                            value={egg.chickenId || ''}
                            onChange={e => handleUpdateEgg(index, { chickenId: e.target.value || undefined })}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-800 dark:text-stone-200 truncate"
                          >
                            <option value="">Unknown / Nest Box General</option>
                            {coopHens.map(hen => {
                              const colorId = getHenDefaultEggColor(hen);
                              const colorMeta = EGG_COLORS.find(c => c.id === colorId);
                              return (
                                <option key={hen.id} value={hen.id}>
                                  {hen.name} ({hen.legBandId || 'No Band'}{colorMeta ? ` · ${colorMeta.label}` : ''})
                                </option>
                              );
                            })}
                            {otherCoopHens.length > 0 && (
                              <optgroup label="Hens in Other Coops">
                                {otherCoopHens.map(hen => {
                                  const colorId = getHenDefaultEggColor(hen);
                                  const colorMeta = EGG_COLORS.find(c => c.id === colorId);
                                  const otherCoop = coops.find(c => c.id === hen.coopId);
                                  return (
                                    <option key={hen.id} value={hen.id}>
                                      {hen.name} ({otherCoop?.name || 'Other'}{colorMeta ? ` · ${colorMeta.label}` : ''})
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                          </select>
                        </div>

                        {/* Condition */}
                        <div>
                          <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 block mb-0.5">Shell Condition</label>
                          <select
                            value={egg.condition}
                            onChange={e => handleUpdateEgg(index, { condition: e.target.value as EggCondition })}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-800 dark:text-stone-200"
                          >
                            <option value="clean_intact">Clean & Intact</option>
                            <option value="dirty">Dirty / Needs Wash</option>
                            <option value="hairline_crack">Hairline Crack</option>
                            <option value="cracked">Cracked / Broken Shell</option>
                            <option value="eaten">Eaten / Broken in Nest Box</option>
                            <option value="incubated">Reserved for Incubation Hatch</option>
                            <option value="sold">Sold / Gifted Carton</option>
                            <option value="double_yolk">Double Yolk (Twin)</option>
                            <option value="soft_shell">Soft / Shell-less (Calcium Deficit)</option>
                            <option value="misshapen">Misshapen / Ridged</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes - Compact */}
          <div>
            <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Flock Observations & Notes (Optional)</label>
            <textarea
              rows={1}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Clean straw added to nest boxes, good shell calcium density..."
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-amber-600 transition-colors resize-none"
            />
          </div>
        </form>

        {/* Compact Pinned Footer */}
        <div className="px-3.5 py-2 sm:px-5 sm:py-2.5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {initialLog ? 'Update Entry' : 'Save Collection'} ({mode === 'quick' ? quickCount : eggs.length})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
