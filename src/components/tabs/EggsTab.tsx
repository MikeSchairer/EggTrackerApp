import React, { useState } from 'react';
import { 
  Egg, 
  Plus, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Trash2, 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Layers 
} from 'lucide-react';
import { Coop, Chicken, EggLog, EggColor, EggSize, EggShape, EggBatch } from '../../types/flock';
import { EGG_SIZES, EGG_COLORS, EGG_SHAPES, CHICKEN_BREEDS } from '../../data/breeds';
import { EggVisual } from '../EggVisual';
import { exportEggsCsv } from '../../utils/storage';
import { calculateLayingRate, calculateEggFreshnessTier } from '../../utils/flockCalculations';

interface EggsTabProps {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  eggBatches?: EggBatch[];
  onOpenLogEggs: () => void;
  onDeleteLog: (logId: string) => void;
  onSaveEggBatch?: (batch: EggBatch) => void;
}

export const EggsTab: React.FC<EggsTabProps> = ({
  coops,
  chickens,
  eggLogs,
  eggBatches = [],
  onOpenLogEggs,
  onDeleteLog,
  onSaveEggBatch,
}) => {
  const [subView, setSubView] = useState<'ledger' | 'inventory'>('ledger');
  const [selectedCoopFilter, setSelectedCoopFilter] = useState<string>('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [selectedShapeFilter, setSelectedShapeFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(eggLogs[0]?.id || null);

  // New batch modal
  const [isNewBatchOpen, setIsNewBatchOpen] = useState<boolean>(false);
  const [batchCode, setBatchCode] = useState<string>(`BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '').slice(2)}`);
  const [batchDate, setBatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [batchCount, setBatchCount] = useState<number>(12);
  const [batchStorage, setBatchStorage] = useState<'countertop' | 'refrigerated'>('countertop');
  const [batchWashed, setBatchWashed] = useState<boolean>(false);
  const [batchNotes, setBatchNotes] = useState<string>('');

  const coopMap = new Map(coops.map(c => [c.id, c]));
  const chickenMap = new Map(chickens.map(c => [c.id, c]));

  // Active laying hens count
  const activeHens = chickens.filter(c => c.gender === 'hen' && (c.lifeStage === 'active_layer' || c.lifeStage === 'point_of_lay') && c.status !== 'deceased' && c.status !== 'sold' && c.status !== 'rehomed');

  // Production Metrics
  const last7DaysLogs = eggLogs.slice(0, 7);
  const last7DaysTotal = last7DaysLogs.reduce((sum, l) => sum + l.totalEggs, 0);
  const last7DaysAvg = last7DaysLogs.length > 0 ? (last7DaysTotal / last7DaysLogs.length).toFixed(1) : '0';
  const layingRate7Day = calculateLayingRate(last7DaysTotal, activeHens.length, Math.max(1, last7DaysLogs.length));

  const last30DaysLogs = eggLogs.slice(0, 30);
  const last30DaysTotal = last30DaysLogs.reduce((sum, l) => sum + l.totalEggs, 0);

  // Condition breakdown
  let countClean = 0;
  let countCracked = 0;
  let countDirty = 0;
  let countEaten = 0;
  let countIncubated = 0;
  let countSold = 0;

  eggLogs.forEach(log => {
    log.eggs.forEach(egg => {
      if (egg.condition === 'clean_intact') countClean++;
      else if (egg.condition === 'cracked' || egg.condition === 'hairline_crack') countCracked++;
      else if (egg.condition === 'dirty') countDirty++;
      else if (egg.condition === 'eaten' || egg.condition === 'soft_shell') countEaten++;
      else if (egg.condition === 'incubated') countIncubated++;
      else if (egg.condition === 'sold') countSold++;
    });
  });

  // Filter logs
  const filteredLogs = eggLogs.filter(log => {
    if (selectedCoopFilter !== 'all' && log.coopId !== selectedCoopFilter) return false;
    if (selectedColorFilter !== 'all' && !log.eggs.some(e => e.color === selectedColorFilter)) return false;
    if (selectedSizeFilter !== 'all' && !log.eggs.some(e => e.size === selectedSizeFilter)) return false;
    if (selectedShapeFilter !== 'all' && !log.eggs.some(e => e.shape === selectedShapeFilter)) return false;
    return true;
  });

  const totalFilteredEggs = filteredLogs.reduce((sum, l) => sum + l.totalEggs, 0);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveEggBatch) return;

    const newBatch: EggBatch = {
      id: `batch-${Date.now()}`,
      batchCode: batchCode.trim() || `BATCH-${Date.now()}`,
      collectionDate: batchDate,
      count: Number(batchCount),
      storageLocation: batchStorage,
      washed: batchWashed,
      cartonSize: Number(batchCount) >= 18 ? 18 : 12,
      notes: batchNotes.trim() || undefined,
    };

    onSaveEggBatch(newBatch);
    setIsNewBatchOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Egg className="w-6 h-6 text-amber-700 dark:text-amber-500" />
            Egg Production Tracker & Freshness Inventory
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Log daily harvests, monitor laying rates, track cracked/eaten/incubated outcomes, and manage carton freshness.
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
            <span>Log Daily Eggs</span>
          </button>
        </div>
      </div>

      {/* Production KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Total */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>7-Day Harvest</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100">{last7DaysTotal}</span>
            <span className="text-xs font-semibold text-stone-500">eggs</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            Avg ~{last7DaysAvg} eggs / day
          </p>
        </div>

        {/* 30-Day Monthly Yield */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>30-Day Monthly Yield</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100">{last30DaysTotal}</span>
            <span className="text-xs font-semibold text-stone-500">eggs</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            ~{Math.round(last30DaysTotal / 12)} dozen total
          </p>
        </div>

        {/* Laying Rate */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Flock Laying Rate</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100">{layingRate7Day}%</span>
            <span className="text-xs font-semibold text-stone-500">efficiency</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            {activeHens.length} active laying hens
          </p>
        </div>

        {/* Freshness Inventory */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Carton Inventory</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100">
              {eggBatches.reduce((acc, b) => acc + b.count, 0)}
            </span>
            <span className="text-xs font-semibold text-stone-500">eggs on hand</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            {eggBatches.length} tracked batches
          </p>
        </div>
      </div>

      {/* Egg Outcomes Strip */}
      <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
          Egg Outcomes & Defect Tracking
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Clean & Intact: <strong>{countClean}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Dirty / Needs Wash: <strong>{countDirty}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Cracked / Hairline: <strong>{countCracked}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1.5">
            Eaten / Soft Shell: <strong>{countEaten}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-1.5">
            Reserved Incubator: <strong>{countIncubated}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-semibold flex items-center gap-1.5">
            Sold / Gifted: <strong>{countSold}</strong>
          </span>
        </div>
      </div>

      {/* Sub-view switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-xs">
        <button
          onClick={() => setSubView('ledger')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            subView === 'ledger'
              ? 'bg-amber-700 text-white dark:bg-amber-600'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          Daily Harvest Ledger
        </button>
        <button
          onClick={() => setSubView('inventory')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            subView === 'inventory'
              ? 'bg-amber-700 text-white dark:bg-amber-600'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Egg Batch & Freshness Inventory ({eggBatches.length})</span>
        </button>
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
