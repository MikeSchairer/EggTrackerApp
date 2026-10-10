import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { Coop, Chicken, EggItem, EggLog, EggSize, EggColor, EggShape, EggCondition } from '../types/flock';
import { EGG_SIZES, EGG_COLORS, EGG_SHAPES, CHICKEN_BREEDS } from '../data/breeds';
import { EggVisual } from './EggVisual';

interface EggLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: EggLog) => void;
  coops: Coop[];
  chickens: Chicken[];
  defaultCoopId?: string;
}

export const EggLoggerModal: React.FC<EggLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  coops,
  chickens,
  defaultCoopId,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>('2026-10-09');
  const [time, setTime] = useState<string>('08:30');
  const [coopId, setCoopId] = useState<string>(defaultCoopId && defaultCoopId !== 'all' ? defaultCoopId : coops[0]?.id || '');
  const [weather, setWeather] = useState<'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Cold Snap' | 'Heatwave'>('Sunny');
  const [notes, setNotes] = useState<string>('');
  const [mode, setMode] = useState<'individual' | 'quick'>('individual');

  // Quick mode count
  const [quickCount, setQuickCount] = useState<number>(4);
  const [quickBroken, setQuickBroken] = useState<number>(0);

  // Individual egg items
  const coopHens = chickens.filter(c => c.coopId === coopId && c.gender === 'hen');

  const [eggs, setEggs] = useState<EggItem[]>([
    {
      id: `egg-${Date.now()}-1`,
      size: 'large',
      color: 'terracotta_brown',
      shape: 'classic_oval',
      weightGrams: 55,
      condition: 'clean_intact',
      chickenId: coopHens[0]?.id || '',
    },
    {
      id: `egg-${Date.now()}-2`,
      size: 'large',
      color: 'sky_blue',
      shape: 'classic_oval',
      weightGrams: 52,
      condition: 'clean_intact',
      chickenId: coopHens[1]?.id || '',
    },
    {
      id: `egg-${Date.now()}-3`,
      size: 'medium',
      color: 'olive_green',
      shape: 'pointed',
      weightGrams: 49,
      condition: 'clean_intact',
      chickenId: coopHens[2]?.id || '',
    },
  ]);

  const handleAddEgg = () => {
    // Default to hen's expected egg color if available
    const nextHen = coopHens[eggs.length % coopHens.length];
    let defaultColor: EggColor = 'terracotta_brown';
    if (nextHen) {
      const breed = CHICKEN_BREEDS.find(b => b.id === nextHen.breedId);
      if (breed) defaultColor = breed.eggColorType;
    }

    setEggs(prev => [
      ...prev,
      {
        id: `egg-${Date.now()}-${prev.length + 1}`,
        size: 'large',
        color: defaultColor,
        shape: 'classic_oval',
        weightGrams: 54,
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
      // If chicken changed, auto-suggest the breed's egg color
      if (updates.chickenId) {
        const hen = chickens.find(c => c.id === updates.chickenId);
        if (hen) {
          const breed = CHICKEN_BREEDS.find(b => b.id === hen.breedId);
          if (breed) {
            updated.color = breed.eggColorType;
            updated.size = breed.expectedEggSize;
          }
        }
      }
      return updated;
    }));
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
        let color: EggColor = 'terracotta_brown';
        let size: EggSize = 'large';
        if (hen) {
          const b = CHICKEN_BREEDS.find(br => br.id === hen.breedId);
          if (b) {
            color = b.eggColorType;
            size = b.expectedEggSize;
          }
        }
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
      id: `log-${Date.now()}`,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Log Daily Egg Collection</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Record daily yield, egg sizes, shell colors, shapes, and coop metrics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Collection Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Coop Location</label>
              <select
                value={coopId}
                onChange={e => setCoopId(e.target.value)}
                required
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 transition-colors"
              >
                {coops.map(coop => (
                  <option key={coop.id} value={coop.id}>
                    {coop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Weather / Temperature Context</label>
              <select
                value={weather}
                onChange={e => setWeather(e.target.value as any)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 transition-colors"
              >
                <option value="Sunny">Sunny / Mild</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Rainy">Overcast / Rain</option>
                <option value="Cold Snap">Cold Snap (&lt;35°F)</option>
                <option value="Heatwave">Heatwave (&gt;88°F)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Entry Method</label>
              <div className="flex rounded-lg border border-stone-200 dark:border-stone-700 p-0.5 bg-stone-100 dark:bg-stone-800">
                <button
                  type="button"
                  onClick={() => setMode('individual')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
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
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    mode === 'quick' 
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' 
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  Quick Batch Count
                </button>
              </div>
            </div>
          </div>

          {/* Quick Count Mode */}
          {mode === 'quick' ? (
            <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Total Eggs Collected</span>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Fast batch logging for routine morning runs.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickCount(Math.max(1, quickCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center text-sm shadow-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-xl font-bold text-amber-700 dark:text-amber-400 w-8 text-center tabular-nums">
                    {quickCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickCount(quickCount + 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center text-sm shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Cracked / Damaged Shells</span>
                  <p className="text-xs text-stone-400 dark:text-stone-500">Recorded for shell quality analytics.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickBroken(Math.max(0, quickBroken - 1))}
                    className="w-7 h-7 rounded-md bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center text-xs shadow-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-semibold text-stone-800 dark:text-stone-200 w-6 text-center tabular-nums">
                    {quickBroken}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickBroken(Math.min(quickCount, quickBroken + 1))}
                    className="w-7 h-7 rounded-md bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center text-xs shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Individual Egg Inspection Mode */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Individual Egg Breakdown ({eggs.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddEgg}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Egg</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {eggs.map((egg, index) => (
                  <div
                    key={egg.id}
                    className="p-3.5 bg-stone-50/80 dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl space-y-3 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <EggVisual color={egg.color} shape={egg.shape} size={egg.size} className="w-8 h-10" />
                        <div>
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Egg #{index + 1}</span>
                          <span className="text-xs text-stone-500 dark:text-stone-400 ml-2 font-mono tabular-nums">
                            {egg.weightGrams ? `${egg.weightGrams}g` : ''}
                          </span>
                        </div>
                      </div>

                      {eggs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEgg(index)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                          title="Remove egg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      {/* Color */}
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-0.5">Shell Color</label>
                        <select
                          value={egg.color}
                          onChange={e => handleUpdateEgg(index, { color: e.target.value as EggColor })}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-xs text-stone-800 dark:text-stone-200 font-medium"
                        >
                          {EGG_COLORS.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Size */}
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-0.5">Size Grade</label>
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
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-xs text-stone-800 dark:text-stone-200 font-medium"
                        >
                          {EGG_SIZES.map(s => (
                            <option key={s.id} value={s.id}>{s.label} ({s.minWeight}-{s.maxWeight}g)</option>
                          ))}
                        </select>
                      </div>

                      {/* Shape */}
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-0.5">Shell Shape</label>
                        <select
                          value={egg.shape}
                          onChange={e => handleUpdateEgg(index, { shape: e.target.value as EggShape })}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-xs text-stone-800 dark:text-stone-200 font-medium"
                        >
                          {EGG_SHAPES.map(sh => (
                            <option key={sh.id} value={sh.id}>{sh.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Weight in Grams */}
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-0.5">Weight (g)</label>
                        <input
                          type="number"
                          min="20"
                          max="95"
                          value={egg.weightGrams || ''}
                          onChange={e => handleUpdateEgg(index, { weightGrams: parseInt(e.target.value) || undefined })}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-xs text-stone-800 dark:text-stone-200 font-mono tabular-nums"
                          placeholder="e.g. 54"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Layer Hen Attribution */}
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-0.5">Layer Bird (Optional)</label>
                        <select
                          value={egg.chickenId || ''}
                          onChange={e => handleUpdateEgg(index, { chickenId: e.target.value || undefined })}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-xs text-stone-800 dark:text-stone-200"
                        >
                          <option value="">Unknown / Nest Box General</option>
                          {coopHens.map(hen => (
                            <option key={hen.id} value={hen.id}>
                              {hen.name} ({hen.legBandId || 'No Band'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Condition */}
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-0.5">Shell Condition</label>
                        <select
                          value={egg.condition}
                          onChange={e => handleUpdateEgg(index, { condition: e.target.value as EggCondition })}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 text-xs text-stone-800 dark:text-stone-200"
                        >
                          <option value="clean_intact">Clean & Intact</option>
                          <option value="dirty">Muddy / Dirty Nest</option>
                          <option value="double_yolk">Double Yolk (Twin)</option>
                          <option value="hairline_crack">Hairline Crack</option>
                          <option value="soft_shell">Soft / Rubber Shell</option>
                          <option value="misshapen">Misshapen / Ridged</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Flock Observations & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Clean straw added to nesting boxes, noticed good calcium density on shells..."
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 focus:outline-hidden focus:border-amber-700 transition-colors resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
            >
              Save Egg Collection ({mode === 'quick' ? quickCount : eggs.length} Eggs)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
