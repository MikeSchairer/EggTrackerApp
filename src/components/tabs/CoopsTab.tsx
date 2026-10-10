import React, { useState } from 'react';
import { Home, Plus, Edit3, Trash2, ArrowRightLeft, Thermometer, Box, Bed, Sparkles, CheckCircle2 } from 'lucide-react';
import { Coop, Chicken, EggLog } from '../../types/flock';
import { CHICKEN_BREEDS } from '../../data/breeds';

interface CoopsTabProps {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  onOpenAddCoop: () => void;
  onEditCoop: (coop: Coop) => void;
  onDeleteCoop: (coopId: string) => void;
  onTransferChicken: (chickenId: string, targetCoopId: string) => void;
  onCleanCoop: (coopId: string) => void;
}

export const CoopsTab: React.FC<CoopsTabProps> = ({
  coops,
  chickens,
  eggLogs,
  onOpenAddCoop,
  onEditCoop,
  onDeleteCoop,
  onTransferChicken,
  onCleanCoop,
}) => {
  const [selectedCoopId, setSelectedCoopId] = useState<string>(coops[0]?.id || '');
  const [movingBirdId, setMovingBirdId] = useState<string | null>(null);

  const activeCoop = coops.find(c => c.id === selectedCoopId) || coops[0];
  const coopChickens = activeCoop ? chickens.filter(c => c.coopId === activeCoop.id) : [];

  // Recent 7 days eggs in this coop
  const coopEggsLast7Days = activeCoop
    ? eggLogs.filter(l => l.coopId === activeCoop.id).slice(0, 7).reduce((sum, l) => sum + l.totalEggs, 0)
    : 0;

  // Cleaning calculation
  const getDaysSinceClean = (dateStr: string) => {
    const last = new Date(dateStr).getTime();
    const now = new Date('2026-10-09').getTime();
    return Math.max(0, Math.floor((now - last) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Multi-Coop Facility Management</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor density, roost bar allocations, nesting box ratios, bedding hygiene, and bird assignments.
          </p>
        </div>

        <button
          onClick={onOpenAddCoop}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Coop</span>
        </button>
      </div>

      {/* Coop Selector Pills / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {coops.map(coop => {
          const birdCount = chickens.filter(c => c.coopId === coop.id).length;
          const percent = coop.capacity > 0 ? Math.round((birdCount / coop.capacity) * 100) : 0;
          const isSelected = activeCoop?.id === coop.id;
          const daysClean = getDaysSinceClean(coop.lastCleanedDate);

          return (
            <div
              key={coop.id}
              onClick={() => setSelectedCoopId(coop.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'item-card-selected ring-1 ring-amber-500/50'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: coop.colorTheme }}
                  >
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 item-title">{coop.name}</h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 item-subtext truncate max-w-[150px]">{coop.locationDescription}</p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                  {birdCount} / {coop.capacity}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span>Occupancy</span>
                  <span className="font-mono font-medium text-stone-800 dark:text-stone-200">{percent}%</span>
                </div>
                <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, percent)}%`,
                      backgroundColor: percent > 90 ? '#DC2626' : coop.colorTheme,
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>Cleaned {daysClean === 0 ? 'today' : `${daysClean}d ago`}</span>
                <span className="font-mono text-stone-700 dark:text-stone-300">{coop.nestingBoxes} boxes</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Coop Detailed Command Center */}
      {activeCoop && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs p-6 space-y-6 transition-colors">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{activeCoop.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700">
                  {coopChickens.length} Resident Birds
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{activeCoop.locationDescription}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => onCleanCoop(activeCoop.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
                title="Mark bedding as cleaned today"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mark Cleaned Today</span>
              </button>

              <button
                onClick={() => onEditCoop(activeCoop)}
                className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                title="Edit coop specs"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {coops.length > 1 && (
                <button
                  onClick={() => {
                    if (coopChickens.length > 0) {
                      alert('Please transfer or remove all birds before deleting this coop.');
                      return;
                    }
                    if (window.confirm(`Delete ${activeCoop.name}?`)) {
                      onDeleteCoop(activeCoop.id);
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  title="Delete coop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-semibold uppercase mb-1">
                <Box className="w-3.5 h-3.5" />
                <span>Nesting Ratio</span>
              </div>
              <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                {activeCoop.nestingBoxes} Boxes
              </span>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                ~{Math.round((coopChickens.length / Math.max(1, activeCoop.nestingBoxes)) * 10) / 10} hens / box
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-semibold uppercase mb-1">
                <Bed className="w-3.5 h-3.5" />
                <span>Roost Bar</span>
              </div>
              <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                {activeCoop.roostLengthFeet} ft
              </span>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                ~{Math.round(((activeCoop.roostLengthFeet * 12) / Math.max(1, coopChickens.length)) * 10) / 10}" per bird
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-semibold uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bedding</span>
              </div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">
                {activeCoop.beddingType}
              </span>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                Cleaned: {activeCoop.lastCleanedDate}
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-semibold uppercase mb-1">
                <Thermometer className="w-3.5 h-3.5" />
                <span>Target Temp</span>
              </div>
              <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                {activeCoop.targetTempFahrenheit || 65}°F
              </span>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">Ventilated season profile</p>
            </div>
          </div>

          {/* Assigned Birds Directory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Resident Birds ({coopChickens.length})
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Capacity remaining: {Math.max(0, activeCoop.capacity - coopChickens.length)} spots
              </span>
            </div>

            {coopChickens.length === 0 ? (
              <div className="p-6 text-center bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-500 dark:text-stone-400">
                No chickens assigned to this coop currently. Use the transfer selector on another coop to relocate birds here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {coopChickens.map(chicken => {
                  const breed = CHICKEN_BREEDS.find(b => b.id === chicken.breedId);

                  return (
                    <div
                      key={chicken.id}
                      className="p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl space-y-2 text-xs hover:border-amber-700/40 dark:hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: chicken.avatarColor }}
                          >
                            {chicken.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 dark:text-stone-100 block">{chicken.name}</span>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">{breed?.name}</span>
                          </div>
                        </div>

                        {chicken.legBandId && (
                          <span className="text-[10px] font-mono bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-1 rounded-sm text-stone-600 dark:text-stone-300">
                            {chicken.legBandId}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-200 dark:border-stone-700/60 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300">
                        <span className="capitalize">{chicken.lifeStage.replace('_', ' ')}</span>

                        {/* Move bird to other coop */}
                        {coops.length > 1 && (
                          <div className="flex items-center gap-1">
                            <span className="text-stone-400 dark:text-stone-500">Move:</span>
                            <select
                              value={chicken.coopId}
                              onChange={e => onTransferChicken(chicken.id, e.target.value)}
                              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-1.5 py-0.5 text-[11px] text-stone-800 dark:text-stone-200 font-medium"
                            >
                              {coops.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          {activeCoop.notes && (
            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-600 dark:text-stone-300">
              <strong className="text-stone-800 dark:text-stone-200 block mb-0.5">Facility Notes:</strong>
              <p>{activeCoop.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
