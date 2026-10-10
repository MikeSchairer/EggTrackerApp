import React, { useState } from 'react';
import { Egg, Plus, Filter, Download, ChevronDown, ChevronUp, Calendar, Trash2 } from 'lucide-react';
import { Coop, Chicken, EggLog, EggColor, EggSize, EggShape } from '../../types/flock';
import { EGG_SIZES, EGG_COLORS, EGG_SHAPES, CHICKEN_BREEDS } from '../../data/breeds';
import { EggVisual } from '../EggVisual';
import { exportEggsCsv } from '../../utils/storage';

interface EggsTabProps {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  onOpenLogEggs: () => void;
  onDeleteLog: (logId: string) => void;
}

export const EggsTab: React.FC<EggsTabProps> = ({
  coops,
  chickens,
  eggLogs,
  onOpenLogEggs,
  onDeleteLog,
}) => {
  const [selectedCoopFilter, setSelectedCoopFilter] = useState<string>('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [selectedShapeFilter, setSelectedShapeFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(eggLogs[0]?.id || null);

  const coopMap = new Map(coops.map(c => [c.id, c]));
  const chickenMap = new Map(chickens.map(c => [c.id, c]));

  // Filter logs
  const filteredLogs = eggLogs.filter(log => {
    if (selectedCoopFilter !== 'all' && log.coopId !== selectedCoopFilter) return false;
    
    // Check if log contains any egg matching the criteria
    if (selectedColorFilter !== 'all') {
      const hasColor = log.eggs.some(e => e.color === selectedColorFilter);
      if (!hasColor) return false;
    }
    if (selectedSizeFilter !== 'all') {
      const hasSize = log.eggs.some(e => e.size === selectedSizeFilter);
      if (!hasSize) return false;
    }
    if (selectedShapeFilter !== 'all') {
      const hasShape = log.eggs.some(e => e.shape === selectedShapeFilter);
      if (!hasShape) return false;
    }

    return true;
  });

  const totalFilteredEggs = filteredLogs.reduce((sum, l) => sum + l.totalEggs, 0);

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Daily Egg Production Ledger</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Detailed harvest records, shell quality grades, weights, and egg attributes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportEggsCsv(eggLogs, chickens, coops)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/60 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenLogEggs}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Egg Batch</span>
          </button>
        </div>
      </div>

      {/* Visual Egg Spectrum Banner */}
      <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">Flock Egg Color Spectrum</span>
          <span className="text-stone-500 dark:text-stone-400">8 natural pigment varieties tracked</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-1">
          {EGG_COLORS.map(c => {
            const count = eggLogs.reduce((sum, log) => sum + log.eggs.filter(e => e.color === c.id).length, 0);
            const isSelected = selectedColorFilter === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedColorFilter(isSelected ? 'all' : c.id)}
                className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center ${
                  isSelected
                    ? 'item-card-selected ring-1 ring-amber-500/50'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                }`}
              >
                <EggVisual color={c.id as EggColor} size="medium" className="w-6 h-8" />
                <span className="text-[11px] font-semibold text-stone-800 dark:text-stone-200 item-title mt-2 truncate max-w-full">
                  {c.label}
                </span>
                <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 item-subtext tabular-nums">
                  {count} logged
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Coop filter */}
          <select
            value={selectedCoopFilter}
            onChange={e => setSelectedCoopFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Coops ({coops.length})</option>
            {coops.map(coop => (
              <option key={coop.id} value={coop.id}>{coop.name}</option>
            ))}
          </select>

          {/* Size filter */}
          <select
            value={selectedSizeFilter}
            onChange={e => setSelectedSizeFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Sizes</option>
            {EGG_SIZES.map(s => (
              <option key={s.id} value={s.id}>{s.label} ({s.minWeight}-{s.maxWeight}g)</option>
            ))}
          </select>

          {/* Color filter */}
          <select
            value={selectedColorFilter}
            onChange={e => setSelectedColorFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Colors</option>
            {EGG_COLORS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Shape filter */}
          <select
            value={selectedShapeFilter}
            onChange={e => setSelectedShapeFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Shell Shapes</option>
            {EGG_SHAPES.map(sh => (
              <option key={sh.id} value={sh.id}>{sh.label}</option>
            ))}
          </select>

          {(selectedCoopFilter !== 'all' || selectedColorFilter !== 'all' || selectedSizeFilter !== 'all' || selectedShapeFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedCoopFilter('all');
                setSelectedColorFilter('all');
                setSelectedSizeFilter('all');
                setSelectedShapeFilter('all');
              }}
              className="text-amber-700 dark:text-amber-400 hover:underline font-semibold text-xs ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span>
            Showing <strong className="text-stone-900 dark:text-stone-100 font-mono">{filteredLogs.length}</strong> collection entries (<strong className="text-stone-900 dark:text-stone-100 font-mono">{totalFilteredEggs}</strong> eggs)
          </span>
          <span>Ledger sorted latest first</span>
        </div>
      </div>

      {/* Collection Logs List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
            <Egg className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">No egg records match filter criteria</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Try resetting the filters or record a new collection.</p>
            <button
              onClick={onOpenLogEggs}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs"
            >
              Log First Batch
            </button>
          </div>
        ) : (
          filteredLogs.map(log => {
            const coop = coopMap.get(log.coopId);
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                      <Egg className="w-5 h-5 fill-amber-100 dark:fill-amber-950/40" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {coop?.name || 'Coop'}
                        </span>
                        <span className="text-stone-300 dark:text-stone-600">·</span>
                        <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {log.date} {log.time ? `at ${log.time}` : ''}
                        </span>
                        {log.weather && (
                          <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">
                            ({log.weather})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {log.eggs.slice(0, 10).map((egg, i) => (
                          <EggVisual key={egg.id || i} color={egg.color} shape={egg.shape} size={egg.size} className="w-4 h-5" />
                        ))}
                        {log.eggs.length > 10 && (
                          <span className="text-[10px] font-mono font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded-sm">
                            +{log.eggs.length - 10}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                        {log.totalEggs}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 ml-1">eggs</span>
                      {log.brokenCount > 0 && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{log.brokenCount} cracked</p>
                      )}
                    </div>

                    <div className="text-stone-400 dark:text-stone-500">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded egg items breakdown */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/60 space-y-4">
                    {log.notes && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 italic bg-white dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200/80 dark:border-stone-700">
                        "{log.notes}"
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Harvest Inspection Details ({log.eggs.length} eggs)</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this egg collection entry?')) {
                              onDeleteLog(log.id);
                            }
                          }}
                          className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-normal flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Entry</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {log.eggs.map((egg, index) => {
                          const hen = egg.chickenId ? chickenMap.get(egg.chickenId) : null;
                          const breed = hen ? CHICKEN_BREEDS.find(b => b.id === hen.breedId) : null;
                          const colorMeta = EGG_COLORS.find(c => c.id === egg.color);
                          const shapeMeta = EGG_SHAPES.find(s => s.id === egg.shape);
                          const sizeMeta = EGG_SIZES.find(s => s.id === egg.size);

                          return (
                            <div
                              key={egg.id || index}
                              className="p-3 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-xl space-y-2 text-xs hover:border-amber-700/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <EggVisual color={egg.color} shape={egg.shape} size={egg.size} className="w-7 h-9" />
                                <div>
                                  <div className="font-bold text-stone-900 dark:text-stone-100">
                                    Egg #{index + 1} · {sizeMeta?.label || egg.size}
                                  </div>
                                  <div className="text-stone-500 dark:text-stone-400 font-mono text-[11px] tabular-nums">
                                    {egg.weightGrams ? `${egg.weightGrams}g` : 'Weight unrecorded'}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1 text-[11px] text-stone-600 dark:text-stone-300 pt-1 border-t border-stone-100 dark:border-stone-700">
                                <div className="flex justify-between">
                                  <span className="text-stone-400 dark:text-stone-500">Color:</span>
                                  <span className="font-medium text-stone-800 dark:text-stone-200">{colorMeta?.label || egg.color}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-stone-400 dark:text-stone-500">Shape:</span>
                                  <span className="font-medium text-stone-800 dark:text-stone-200">{shapeMeta?.label || egg.shape}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-stone-400 dark:text-stone-500">Condition:</span>
                                  <span className={`font-medium ${egg.condition === 'clean_intact' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'}`}>
                                    {egg.condition.replace('_', ' ')}
                                  </span>
                                </div>
                                {hen && (
                                  <div className="flex justify-between pt-1 border-t border-stone-100/60 dark:border-stone-700/60 text-amber-900 dark:text-amber-300">
                                    <span>Layer:</span>
                                    <span className="font-semibold">{hen.name} ({breed?.name})</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
