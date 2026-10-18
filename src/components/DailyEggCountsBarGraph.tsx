import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Egg, 
  Calendar, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Filter, 
  CheckCircle2, 
  X,
  Clock,
  CloudSun,
  Layers
} from 'lucide-react';
import { Coop, Chicken, EggLog } from '../types/flock';
import { EggVisual } from './EggVisual';

interface DailyEggCountsBarGraphProps {
  eggLogs: EggLog[];
  coops: Coop[];
  chickens: Chicken[];
  onOpenLogEggs: () => void;
  onNavigateToEggsTab?: () => void;
}

export type TimeWindow = 7 | 14 | 30;

export const DailyEggCountsBarGraph: React.FC<DailyEggCountsBarGraphProps> = ({
  eggLogs,
  coops,
  chickens,
  onOpenLogEggs,
  onNavigateToEggsTab,
}) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(14);
  const [selectedCoopId, setSelectedCoopId] = useState<string>('all');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const activeLayersCount = useMemo(
    () => chickens.filter(c => c.lifeStage === 'active_layer').length,
    [chickens]
  );

  const coopMap = useMemo(() => new Map(coops.map(c => [c.id, c])), [coops]);

  // Filter logs by selected coop if any
  const filteredLogs = useMemo(() => {
    if (selectedCoopId === 'all') return eggLogs;
    return eggLogs.filter(l => l.coopId === selectedCoopId);
  }, [eggLogs, selectedCoopId]);

  // Determine end date for graph
  const maxLogDate = useMemo(() => {
    return filteredLogs.reduce((max, l) => (l.date > max ? l.date : max), todayStr);
  }, [filteredLogs, todayStr]);

  // Build daily data series
  const dailySeries = useMemo(() => {
    const series = [];
    const endTime = new Date(maxLogDate).getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = timeWindow - 1; i >= 0; i--) {
      const d = new Date(endTime - i * dayMs);
      const dStr = d.toISOString().split('T')[0];
      const isToday = dStr === todayStr;

      const dayLogs = filteredLogs.filter(l => l.date === dStr);
      const totalEggs = dayLogs.reduce((sum, l) => sum + l.totalEggs, 0);
      const brokenCount = dayLogs.reduce((sum, l) => sum + l.brokenCount, 0);
      const intactEggs = Math.max(0, totalEggs - brokenCount);

      const coopBreakdown: Record<string, number> = {};
      dayLogs.forEach(l => {
        coopBreakdown[l.coopId] = (coopBreakdown[l.coopId] || 0) + l.totalEggs;
      });

      const dayOfWeekShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDayShort = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayNum = d.getDate();

      const activeDenominator = Math.max(1, activeLayersCount);
      const efficiencyPercent = Math.min(100, Math.round((totalEggs / activeDenominator) * 100));

      series.push({
        date: dStr,
        displayDate: monthDayShort,
        dayOfWeek: dayOfWeekShort,
        dayNum,
        isToday,
        totalEggs,
        intactEggs,
        brokenCount,
        efficiencyPercent,
        coopBreakdown,
        logs: dayLogs,
      });
    }

    return series;
  }, [maxLogDate, timeWindow, filteredLogs, todayStr, activeLayersCount]);

  // Aggregate statistics for the selected time window
  const periodTotalEggs = useMemo(
    () => dailySeries.reduce((sum, d) => sum + d.totalEggs, 0),
    [dailySeries]
  );
  const periodTotalBroken = useMemo(
    () => dailySeries.reduce((sum, d) => sum + d.brokenCount, 0),
    [dailySeries]
  );
  const periodAverage = useMemo(
    () => (dailySeries.length > 0 ? periodTotalEggs / dailySeries.length : 0),
    [periodTotalEggs, dailySeries]
  );
  const peakDay = useMemo(() => {
    if (dailySeries.length === 0) return null;
    let max = dailySeries[0];
    for (const d of dailySeries) {
      if (d.totalEggs > max.totalEggs) {
        max = d;
      }
    }
    return max.totalEggs > 0 ? max : null;
  }, [dailySeries]);

  const maxEggsInSeries = useMemo(
    () => Math.max(...dailySeries.map(d => d.totalEggs), 0),
    [dailySeries]
  );

  // Compute dynamic nice Y-axis max and ticks
  const { yAxisMax, yTicks } = useMemo(() => {
    let top = Math.max(4, maxEggsInSeries);
    // Round top up to nice intervals
    if (top <= 5) top = 6;
    else if (top <= 10) top = 10;
    else if (top <= 15) top = 16;
    else if (top <= 20) top = 20;
    else if (top <= 30) top = 30;
    else if (top <= 50) top = Math.ceil(top / 10) * 10;
    else top = Math.ceil(top / 20) * 20;

    const step = top / 4;
    const ticks = [top, Math.round(step * 3), Math.round(step * 2), Math.round(step), 0];
    return { yAxisMax: top, yTicks: ticks };
  }, [maxEggsInSeries]);

  // Average line height percentage
  const avgHeightPercent = Math.min(100, Math.max(0, (periodAverage / yAxisMax) * 100));

  // Selected day object
  const activeSelectedDay = useMemo(() => {
    if (!selectedDayDate) return null;
    return dailySeries.find(d => d.date === selectedDayDate) || null;
  }, [dailySeries, selectedDayDate]);

  return (
    <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-6 transition-colors">
      {/* 1. Header with Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Daily Egg Counts
              </h2>
              <span className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                {timeWindow}-Day Yield Chart
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Daily harvest history, laying consistency, and broken egg rates across coops.
            </p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Time window selector pills */}
          <div className="inline-flex items-center p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setTimeWindow(7)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeWindow === 7
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeWindow(14)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeWindow === 14
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeWindow(30)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeWindow === 30
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Coop filter dropdown if multiple coops */}
          {coops.length > 1 && (
            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedCoopId}
                onChange={(e) => setSelectedCoopId(e.target.value)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Coops ({coops.length})</option>
                {coops.map((coop) => (
                  <option key={coop.id} value={coop.id}>
                    {coop.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Log Button */}
          <button
            onClick={onOpenLogEggs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Eggs</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Strip for Selected Window */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 sm:p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Harvest</span>
            <Egg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {periodTotalEggs}
            </span>
            <span className="text-xs text-stone-500">eggs</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            ~{Math.round((periodTotalEggs / 12) * 10) / 10} dozen cartons
          </p>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Daily Average</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {periodAverage.toFixed(1)}
            </span>
            <span className="text-xs text-stone-500">/ day</span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
            {activeLayersCount > 0
              ? `${Math.round((periodAverage / activeLayersCount) * 100)}% flock lay rate`
              : 'Flock layers registered'}
          </p>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Peak Daily Harvest</span>
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {peakDay ? peakDay.totalEggs : 0}
            </span>
            <span className="text-xs text-stone-500">eggs</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
            {peakDay ? peakDay.displayDate : 'No collection yet'}
          </p>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shell Quality</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {periodTotalEggs > 0
                ? `${Math.round(((periodTotalEggs - periodTotalBroken) / periodTotalEggs) * 100)}%`
                : '100%'}
            </span>
            <span className="text-xs text-stone-500">clean</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            {periodTotalBroken > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">{periodTotalBroken} cracked/broken</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Zero damaged shells</span>
            )}
          </p>
        </div>
      </div>

      {/* 3. Bar Graph Visual Canvas */}
      {periodTotalEggs === 0 && eggLogs.length === 0 ? (
        /* Empty State with inviting call to action */
        <div className="py-12 px-6 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 text-center space-y-4 bg-stone-50/50 dark:bg-stone-800/20">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <Egg className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              No daily egg counts recorded yet
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Log your daily morning or evening egg basket collections to unlock visual daily bar charts, peak production tracking, and laying efficiency curves.
            </p>
          </div>
          <button
            onClick={onOpenLogEggs}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log First Egg Collection</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Legend and Helper */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-gradient-to-t from-amber-600 to-amber-400 shadow-xs" />
                <span className="font-medium text-stone-700 dark:text-stone-300">Intact Eggs</span>
              </div>
              {periodTotalBroken > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-500 shadow-xs" />
                  <span className="font-medium text-stone-700 dark:text-stone-300">Cracked / Damaged</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-4 border-b-2 border-dashed border-amber-600/70 dark:border-amber-400/80" />
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  Period Average ({periodAverage.toFixed(1)}/d)
                </span>
              </div>
            </div>
            <span className="text-[11px] text-stone-400">
              Click any bar to inspect date details
            </span>
          </div>

          {/* Chart Frame */}
          <div className="relative pt-6 pb-2">
            {/* Chart Area with Y-axis */}
            <div className="flex gap-2 sm:gap-4 items-stretch h-56 sm:h-64">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between items-end text-[10px] sm:text-xs font-mono text-stone-400 dark:text-stone-500 shrink-0 select-none pb-7">
                {yTicks.map((tick) => (
                  <span key={tick} className="leading-none tabular-nums">
                    {tick}
                  </span>
                ))}
              </div>

              {/* Chart Grid and Bars */}
              <div className="relative flex-1 flex flex-col justify-between">
                {/* Horizontal Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                  {yTicks.map((tick) => (
                    <div
                      key={tick}
                      className="w-full border-b border-stone-100 dark:border-stone-800/80"
                    />
                  ))}
                </div>

                {/* Average Reference Line */}
                {periodAverage > 0 && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/70 dark:border-amber-400/60 z-10 pointer-events-none transition-all"
                    style={{ bottom: `calc(28px + ${(avgHeightPercent / 100) * 196}px)` }}
                  >
                    <span className="absolute -top-3.5 right-1 px-1.5 py-0.5 rounded-sm bg-amber-100/90 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold shadow-xs">
                      Avg: {periodAverage.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Bars Row */}
                <div className="relative z-10 flex-1 flex items-end justify-between gap-1 sm:gap-2 pb-7">
                  {dailySeries.map((item) => {
                    const isHovered = hoveredDate === item.date;
                    const isSelected = selectedDayDate === item.date;

                    // Bar height percentage
                    const barHeightPercent =
                      item.totalEggs > 0
                        ? Math.min(100, Math.max(8, (item.totalEggs / yAxisMax) * 100))
                        : 0;

                    // Broken ratio
                    const brokenRatio = item.totalEggs > 0 ? item.brokenCount / item.totalEggs : 0;
                    const intactRatio = 1 - brokenRatio;

                    return (
                      <div
                        key={item.date}
                        onMouseEnter={() => setHoveredDate(item.date)}
                        onMouseLeave={() => setHoveredDate(null)}
                        onClick={() => setSelectedDayDate(prev => prev === item.date ? null : item.date)}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      >
                        {/* Hover Tooltip Popover */}
                        {isHovered && (
                          <div className="absolute -top-24 sm:-top-28 z-30 pointer-events-none bg-stone-900 dark:bg-stone-800 text-white text-xs rounded-xl p-2.5 shadow-xl border border-stone-700 min-w-[170px] transition-all transform -translate-x-1/2 left-1/2 animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between border-b border-stone-700/80 pb-1 mb-1.5">
                              <span className="font-bold text-amber-300">{item.displayDate}</span>
                              {item.isToday && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-amber-500 text-stone-950 font-bold uppercase">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-stone-200">
                                <span>Total Harvest:</span>
                                <span className="font-mono font-bold text-white tabular-nums">
                                  {item.totalEggs} eggs
                                </span>
                              </div>
                              {item.brokenCount > 0 && (
                                <div className="flex items-center justify-between text-rose-300 text-[11px]">
                                  <span>Broken/Cracked:</span>
                                  <span className="font-mono font-bold tabular-nums">{item.brokenCount}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-stone-400 text-[11px]">
                                <span>Laying Efficiency:</span>
                                <span className="font-mono text-emerald-300 font-semibold">{item.efficiencyPercent}%</span>
                              </div>
                              {/* Coop breakdown */}
                              {Object.keys(item.coopBreakdown).length > 1 && (
                                <div className="pt-1 mt-1 border-t border-stone-700/60 text-[10px] text-stone-300 space-y-0.5">
                                  {Object.entries(item.coopBreakdown).map(([cId, count]) => (
                                    <div key={cId} className="flex justify-between">
                                      <span className="truncate max-w-[100px]">{coopMap.get(cId)?.name || 'Coop'}:</span>
                                      <span className="font-mono font-bold">{count}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Tiny pointer arrow */}
                            <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-stone-900 dark:bg-stone-800 rotate-45 border-r border-b border-stone-700" />
                          </div>
                        )}

                        {/* Top Number Badge */}
                        <div className="mb-1 text-[10px] sm:text-xs font-mono font-bold tabular-nums transition-colors">
                          {item.totalEggs > 0 ? (
                            <span
                              className={`${
                                item.isToday
                                  ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                                  : isSelected
                                  ? 'text-amber-700 dark:text-amber-300'
                                  : 'text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100'
                              }`}
                            >
                              {item.totalEggs}
                            </span>
                          ) : (
                            <span className="text-stone-300 dark:text-stone-600 group-hover:text-stone-400">
                              0
                            </span>
                          )}
                        </div>

                        {/* Visual Bar */}
                        <div
                          className={`w-full max-w-[38px] rounded-t-md transition-all relative flex flex-col justify-end overflow-hidden ${
                            isSelected
                              ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-stone-900 shadow-md'
                              : ''
                          } ${
                            item.isToday
                              ? 'ring-1 ring-amber-400 shadow-sm'
                              : ''
                          }`}
                          style={{
                            height: item.totalEggs > 0 ? `${barHeightPercent}%` : '4px',
                          }}
                        >
                          {item.totalEggs === 0 ? (
                            <div className="w-full h-full bg-stone-200 dark:bg-stone-750 group-hover:bg-amber-300 dark:group-hover:bg-amber-800 rounded-full transition-colors" />
                          ) : (
                            <>
                              {/* Broken segment at top if any */}
                              {brokenRatio > 0 && (
                                <div
                                  className="w-full bg-rose-500 group-hover:bg-rose-400 transition-colors"
                                  style={{ height: `${brokenRatio * 100}%` }}
                                />
                              )}
                              {/* Intact segment */}
                              <div
                                className={`w-full transition-all ${
                                  item.isToday
                                    ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300'
                                    : 'bg-gradient-to-t from-amber-700 to-amber-500/90 group-hover:from-amber-600 group-hover:to-amber-400'
                                }`}
                                style={{ height: `${intactRatio * 100}%` }}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Date Labels Row */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between gap-1 sm:gap-2 text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 pt-1 select-none">
                  {dailySeries.map((item, idx) => {
                    const isSelected = selectedDayDate === item.date;
                    // In 30-day mode, hide alternate labels to prevent overlap on small screens
                    const showLabel =
                      timeWindow <= 14 ||
                      idx % 3 === 0 ||
                      idx === dailySeries.length - 1;

                    return (
                      <div
                        key={item.date}
                        onClick={() => setSelectedDayDate(prev => prev === item.date ? null : item.date)}
                        className={`flex-1 text-center truncate cursor-pointer transition-colors ${
                          item.isToday
                            ? 'font-bold text-amber-700 dark:text-amber-400'
                            : isSelected
                            ? 'font-bold text-stone-900 dark:text-stone-100'
                            : 'hover:text-stone-800 dark:hover:text-stone-200'
                        }`}
                      >
                        {showLabel ? (
                          <span>
                            {item.isToday ? (
                              'Today'
                            ) : timeWindow === 7 ? (
                              `${item.dayOfWeek} ${item.dayNum}`
                            ) : (
                              item.dayNum
                            )}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Day Inspector Card (Expands when clicking a specific day) */}
      {activeSelectedDay && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-800/80 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-amber-800/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Harvest Details for {activeSelectedDay.displayDate} {activeSelectedDay.isToday && '(Today)'}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDayDate(null)}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200/70 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400 block text-[11px] uppercase font-bold">
                Total Collected
              </span>
              <span className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
                {activeSelectedDay.totalEggs} eggs
              </span>
              <p className="text-[11px] text-stone-400">
                {activeSelectedDay.brokenCount > 0
                  ? `${activeSelectedDay.intactEggs} intact · ${activeSelectedDay.brokenCount} cracked`
                  : 'All intact and clean'}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200/70 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400 block text-[11px] uppercase font-bold">
                Laying Efficiency
              </span>
              <span className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                {activeSelectedDay.efficiencyPercent}%
              </span>
              <p className="text-[11px] text-stone-400">
                Of {activeLayersCount} active laying hens
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200/70 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400 block text-[11px] uppercase font-bold">
                Collections Logged
              </span>
              <span className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
                {activeSelectedDay.logs.length} entries
              </span>
              <p className="text-[11px] text-stone-400">
                Recorded across facilities
              </p>
            </div>
          </div>

          {/* List of batches on this day */}
          {activeSelectedDay.logs.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block">
                Collection Log Entries:
              </span>
              <div className="space-y-1.5">
                {activeSelectedDay.logs.map((log) => {
                  const coop = coopMap.get(log.coopId);
                  return (
                    <div
                      key={log.id}
                      className="p-2.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: coop?.colorTheme || '#B45309' }}
                        />
                        <div>
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {coop?.name || 'Coop'}
                          </span>
                          {log.time && (
                            <span className="text-stone-500 dark:text-stone-400 ml-1.5">
                              at {log.time}
                            </span>
                          )}
                          {log.weather && (
                            <span className="text-stone-400 ml-1.5">· {log.weather}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                          {log.totalEggs} eggs
                        </span>
                        {log.brokenCount > 0 && (
                          <span className="text-[11px] text-rose-600 font-medium">
                            ({log.brokenCount} cracked)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            {onNavigateToEggsTab && (
              <button
                onClick={onNavigateToEggsTab}
                className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
              >
                View in Eggs Ledger →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
