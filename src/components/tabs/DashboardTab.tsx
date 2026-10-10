import React from 'react';
import { Egg, Plus, TrendingUp, Home, ArrowUpRight, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { Coop, Chicken, EggLog } from '../../types/flock';
import { computeFlockSummary, computeDailyProductionTrends } from '../../utils/analytics';
import { EggVisual } from '../EggVisual';
import { CHICKEN_BREEDS } from '../../data/breeds';

interface DashboardTabProps {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  onOpenLogEggs: () => void;
  onOpenAddChicken: () => void;
  onSelectCoop: (coopId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  coops,
  chickens,
  eggLogs,
  onOpenLogEggs,
  onOpenAddChicken,
  onSelectCoop,
  onNavigateToTab,
}) => {
  const summary = computeFlockSummary(eggLogs, chickens);
  const trends = computeDailyProductionTrends(eggLogs, summary.activeLayersCount, 14);

  // Maximum daily eggs in 14-day window for scaling chart
  const maxDayEggs = Math.max(1, ...trends.map(t => t.totalEggs));

  // Today's latest logs
  const todayDate = '2026-10-09';
  const todayLogs = eggLogs.filter(l => l.date === todayDate);

  // Recent 5 logs
  const recentLogs = [...eggLogs]
    .sort((a, b) => new Date(`${b.date}T${b.time || '12:00'}`).getTime() - new Date(`${a.date}T${a.time || '12:00'}`).getTime())
    .slice(0, 5);

  const coopMap = new Map(coops.map(c => [c.id, c]));

  return (
    <div className="space-y-8">
      {/* Hero Pastoral Section */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 text-white shadow-sm">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_flock_pasture_1791579810391.jpg"
            alt="Flock pasture at morning sunrise"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-45"
            onError={(e) => {
              // Fallback styling if image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/70 to-stone-900/40" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 tracking-wider uppercase mb-2">
            <span>Homestead Flock Monitor</span>
            <span>·</span>
            <span>Autumn 2026 Season</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Flock health, egg production, and multi-coop growth in one ledger.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-200 leading-relaxed max-w-2xl">
            Currently overseeing {chickens.length} birds across {coops.length} active coops with {summary.activeLayersCount} active laying hens.
            Daily yield today is <span className="font-semibold text-amber-200">{summary.todayEggCount} fresh eggs</span> at an estimated {summary.currentLayingRatePercent}% laying efficiency.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenLogEggs}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Today's Eggs</span>
            </button>
            <button
              onClick={onOpenAddChicken}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Register Bird</span>
            </button>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-stone-300 hover:text-white transition-colors"
            >
              <span>View Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Metric Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Eggs</span>
            <Egg className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {summary.todayEggCount}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">eggs</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono tabular-nums">
              {summary.currentLayingRatePercent}%
            </span>
            <span>daily laying rate</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">7-Day Moving Avg</span>
            <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {Math.round((summary.totalEggsLast7Days / 7) * 10) / 10}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">eggs / day</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <span className="font-mono font-medium tabular-nums text-stone-700 dark:text-stone-300">{summary.totalEggsLast7Days}</span>
            <span>total collected past 7 days</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Layers</span>
            <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {summary.activeLayersCount}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">/ {summary.totalFlockCount} birds</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <span className="font-mono tabular-nums font-medium text-stone-700 dark:text-stone-300">
              {summary.totalFlockCount - summary.activeLayersCount}
            </span>
            <span>growing pullets & chicks</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Coop Utilization</span>
            <Home className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {Math.round((chickens.length / Math.max(1, coops.reduce((sum, c) => sum + c.capacity, 0))) * 100)}%
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">capacity</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <span className="font-mono tabular-nums text-stone-700 dark:text-stone-300">{coops.length}</span>
            <span>coops in service</span>
          </div>
        </div>
      </div>

      {/* 14-Day Production Trend Chart & Today's Log Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">14-Day Egg Production & Lay Rate</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Daily yield breakdown across coops with laying efficiency percentage.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-700 dark:bg-amber-500" />
                <span>Eggs Collected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
                <span>Lay Rate %</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end justify-between gap-1 sm:gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
              {trends.map((item) => {
                const heightPercent = Math.max(8, Math.round((item.totalEggs / (maxDayEggs + 2)) * 100));
                const isToday = item.date === todayDate;

                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-stone-900 dark:bg-stone-800 text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap shadow-md border border-stone-700">
                      <p className="font-semibold">{item.date}: {item.totalEggs} eggs</p>
                      <p className="text-amber-300 font-mono">{item.layingRatePercent}% lay efficiency</p>
                    </div>

                    {/* Rate pill */}
                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300 tabular-nums">
                      {item.totalEggs}
                    </span>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isToday
                          ? 'bg-amber-600 dark:bg-amber-500 shadow-sm ring-1 ring-amber-400/50'
                          : 'bg-stone-200 dark:bg-stone-800 hover:bg-amber-500/80 dark:hover:bg-amber-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis dates */}
            <div className="flex justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400 pt-2 px-1">
              <span>{trends[0]?.displayDate}</span>
              <span>{trends[Math.floor(trends.length / 2)]?.displayDate}</span>
              <span className="font-bold text-amber-800 dark:text-amber-400">Today ({trends[trends.length - 1]?.displayDate})</span>
            </div>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-750 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-stone-600 dark:text-stone-300">
            <span>Average Shell Integrity: <strong className="text-stone-900 dark:text-stone-100 font-mono">{summary.flawlessRatePercent}% clean & intact</strong></span>
            <span>Avg Weight: <strong className="text-stone-900 dark:text-stone-100 font-mono">{summary.averageEggWeightGrams}g</strong></span>
          </div>
        </div>

        {/* Quick Coops Overview */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Coop Roster</h2>
              <button
                onClick={() => onNavigateToTab('coops')}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                Manage
              </button>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">Current occupancy and nesting box capacity.</p>

            <div className="space-y-3">
              {coops.map((coop) => {
                const coopBirds = chickens.filter(c => c.coopId === coop.id);
                const percent = coop.capacity > 0 ? Math.round((coopBirds.length / coop.capacity) * 100) : 0;

                return (
                  <button
                    key={coop.id}
                    onClick={() => {
                      onSelectCoop(coop.id);
                      onNavigateToTab('coops');
                    }}
                    className="w-full text-left p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-700/60 dark:hover:border-amber-500/60 hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: coop.colorTheme }}
                        />
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-stone-950 dark:group-hover:text-stone-50">
                          {coop.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-stone-600 dark:text-stone-400 tabular-nums">
                        {coopBirds.length} / {coop.capacity} birds
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, percent)}%`,
                          backgroundColor: percent > 90 ? '#DC2626' : coop.colorTheme,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
                      <span>{coop.nestingBoxes} nest boxes · {coop.beddingType}</span>
                      <span className="font-mono">{percent}% full</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => onNavigateToTab('flock')}
              className="w-full py-2 text-center text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              Browse All {chickens.length} Flock Members →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Egg Collections & Quick Flock Growth Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Collections Table */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Recent Collections</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Log entries with shell inspections.</p>
            </div>
            <button
              onClick={() => onNavigateToTab('eggs')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              All Eggs Ledger →
            </button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {recentLogs.map((log) => {
              const coop = coopMap.get(log.coopId);
              return (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-amber-800 dark:text-amber-400">
                      <Egg className="w-5 h-5 fill-amber-50 dark:fill-amber-950/40" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{coop?.name || 'Coop'}</span>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">{log.date} {log.time ? `(${log.time})` : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {log.eggs.slice(0, 5).map((egg) => (
                          <EggVisual key={egg.id} color={egg.color} shape={egg.shape} size={egg.size} className="w-4 h-5" />
                        ))}
                        {log.eggs.length > 5 && (
                          <span className="text-[10px] text-stone-400 font-mono">+{log.eggs.length - 5}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {log.totalEggs}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 ml-1">eggs</span>
                    {log.brokenCount > 0 && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">({log.brokenCount} cracked)</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Tracking Highlights */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Active Growth Monitoring</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Pullets and growing birds under weight observation.</p>
            </div>
            <button
              onClick={() => onNavigateToTab('flock')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Growth Logs →
            </button>
          </div>

          <div className="space-y-3">
            {chickens
              .filter(c => c.weightRecords && c.weightRecords.length > 0)
              .slice(0, 4)
              .map(chicken => {
                const breed = CHICKEN_BREEDS.find(b => b.id === chicken.breedId);
                const latestWeight = chicken.weightRecords[chicken.weightRecords.length - 1];
                const prevWeight = chicken.weightRecords.length > 1 
                  ? chicken.weightRecords[chicken.weightRecords.length - 2] 
                  : null;
                const gain = prevWeight ? latestWeight.weightGrams - prevWeight.weightGrams : 0;

                return (
                  <div key={chicken.id} className="p-3 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-750 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chicken.avatarColor }} />
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{chicken.name}</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">({breed?.name})</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {chicken.lifeStage.replace('_', ' ')} · {latestWeight.ageWeeks} wks old
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                        {latestWeight.weightGrams}g
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-1">
                        ({Math.round((latestWeight.weightGrams / 453.6) * 10) / 10} lbs)
                      </span>
                      {gain > 0 && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                          +{gain}g gained
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
