import React, { useState } from 'react';
import { BarChart3, TrendingUp, Printer, Download, Egg, PieChart, Layers, ShieldCheck, Home } from 'lucide-react';
import { Coop, Chicken, EggLog } from '../../types/flock';
import {
  computeFlockSummary,
  computeDailyProductionTrends,
  computeEggSizeDistribution,
  computeEggColorDistribution,
  computeEggShapeDistribution,
  computeCoopPerformance,
  computeBreedPerformance,
} from '../../utils/analytics';
import { EGG_COLORS, EGG_SIZES, EGG_SHAPES } from '../../data/breeds';
import { EggVisual } from '../EggVisual';
import { exportEggsCsv } from '../../utils/storage';

interface AnalyticsTabProps {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  onOpenPrintReport: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  coops,
  chickens,
  eggLogs,
  onOpenPrintReport,
}) => {
  const [trendWindowDays, setTrendWindowDays] = useState<number>(21);

  const summary = computeFlockSummary(eggLogs, chickens);
  const trends = computeDailyProductionTrends(eggLogs, summary.activeLayersCount, trendWindowDays);
  const sizeDist = computeEggSizeDistribution(eggLogs);
  const colorDist = computeEggColorDistribution(eggLogs);
  const shapeDist = computeEggShapeDistribution(eggLogs);
  const coopPerf = computeCoopPerformance(coops, chickens, eggLogs);
  const breedPerf = computeBreedPerformance(eggLogs, chickens);

  const maxTrendEggs = Math.max(1, ...trends.map(t => t.totalEggs));
  const totalLoggedEggs = eggLogs.reduce((sum, l) => sum + l.totalEggs, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Overall Flock Performance Analytics</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Statistical yield trends, laying efficiency rates, shell attribute distributions, and coop comparisons.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => exportEggsCsv(eggLogs, coops)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenPrintReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Flock Audit Report</span>
          </button>
        </div>
      </div>

      {/* High-Level Benchmark Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">30-Day Total Harvest</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {summary.totalEggsLast30Days}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">eggs</span>
          </div>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            {Math.round((summary.totalEggsLast30Days / 30) * 10) / 10} eggs / day average
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">7-Day Lay Efficiency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-amber-800 dark:text-amber-400 tabular-nums">
              {summary.average7DayLayingRatePercent}%
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">lay rate</span>
          </div>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Based on {summary.activeLayersCount} active laying hens
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">Average Egg Weight</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {summary.averageEggWeightGrams}g
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">large standard</span>
          </div>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Target benchmark: 50g–60g
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">Shell Grade Integrity</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {summary.flawlessRatePercent}%
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">clean & intact</span>
          </div>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Low defect & hairline crack rate
          </p>
        </div>
      </div>

      {/* 21-Day Interactive Production Trend Chart */}
      <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Historical Daily Egg Yield & Lay Rate</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">Continuous daily timeline showing flock output stability.</p>
          </div>

          <div className="flex items-center gap-2">
            {[7, 14, 21].map(days => (
              <button
                key={days}
                onClick={() => setTrendWindowDays(days)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  trendWindowDays === days
                    ? 'bg-amber-600 dark:bg-amber-500 text-white font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="pt-6 pb-2">
          <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
            {trends.map(item => {
              const heightPercent = Math.max(8, Math.round((item.totalEggs / (maxTrendEggs + 2)) * 100));

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-14 z-20 pointer-events-none bg-stone-900 dark:bg-stone-800 text-white text-[10px] rounded-md px-2 py-1.5 whitespace-nowrap shadow-md border border-stone-700">
                    <p className="font-semibold">{item.date}</p>
                    <p>{item.totalEggs} eggs collected</p>
                    <p className="text-amber-300 font-mono">{item.layingRatePercent}% laying efficiency</p>
                  </div>

                  <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300 tabular-nums">
                    {item.totalEggs}
                  </span>

                  <div
                    className="w-full rounded-t-md bg-stone-200 dark:bg-stone-800 group-hover:bg-amber-500/80 dark:group-hover:bg-amber-500 transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400 pt-2 px-1">
            <span>{trends[0]?.displayDate}</span>
            <span>{trends[Math.floor(trends.length / 2)]?.displayDate}</span>
            <span className="font-bold text-amber-800 dark:text-amber-400">{trends[trends.length - 1]?.displayDate}</span>
          </div>
        </div>
      </div>

      {/* Egg Physical Attributes Matrix (Size, Color, Shape) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Size Distribution */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">Egg Size Grade Distribution</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Weight classification of {totalLoggedEggs} total eggs.</p>
          </div>

          <div className="space-y-3">
            {sizeDist.map(item => {
              const meta = EGG_SIZES.find(s => s.id === item.size);

              return (
                <div key={item.size} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {meta?.label} <span className="font-normal text-stone-400 dark:text-stone-500">({meta?.minWeight}-{meta?.maxWeight}g)</span>
                    </span>
                    <span className="font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                      {item.count} eggs ({item.percentage}%)
                    </span>
                  </div>

                  <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-700 dark:bg-amber-500 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Color Palette Breakdown */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">Shell Color Pigmentation</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Natural genetic egg coloration frequencies.</p>
          </div>

          <div className="space-y-3">
            {colorDist.map(item => {
              const meta = EGG_COLORS.find(c => c.id === item.color);
              if (item.count === 0) return null;

              return (
                <div key={item.color} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-stone-300 dark:border-stone-600"
                        style={{ backgroundColor: meta?.hex }}
                      />
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{meta?.label}</span>
                    </div>
                    <span className="font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                      {item.count} eggs ({item.percentage}%)
                    </span>
                  </div>

                  <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: meta?.hex || '#B45309',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shell Shape Distribution */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">Shell Morphology / Shape</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Geometry and surface structure.</p>
          </div>

          <div className="space-y-3">
            {shapeDist.map(item => {
              const meta = EGG_SHAPES.find(s => s.id === item.shape);

              return (
                <div key={item.shape} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{meta?.label}</span>
                    <span className="font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>

                  <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-700 dark:bg-amber-500 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Coop Comparative Efficiency Matrix */}
      <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Multi-Coop Comparative Performance</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">Benchmarking egg share, daily average, and laying efficiency per facility.</p>
        </div>

        <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 font-semibold text-stone-700 dark:text-stone-200">
              <tr>
                <th className="p-3">Coop Facility</th>
                <th className="p-3">Birds / Capacity</th>
                <th className="p-3">Occupancy</th>
                <th className="p-3">Total Eggs</th>
                <th className="p-3">Flock Share</th>
                <th className="p-3">Daily Average</th>
                <th className="p-3 text-right">Laying Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {coopPerf.map(c => (
                <tr key={c.coop.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="p-3 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.coop.colorTheme }} />
                    <span>{c.coop.name}</span>
                  </td>
                  <td className="p-3 font-mono tabular-nums text-stone-700 dark:text-stone-300">
                    {c.chickenCount} / {c.coop.capacity}
                  </td>
                  <td className="p-3 font-mono tabular-nums text-stone-700 dark:text-stone-300">
                    {c.occupancyPercent}%
                  </td>
                  <td className="p-3 font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                    {c.totalEggs}
                  </td>
                  <td className="p-3 font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                    {c.eggSharePercent}%
                  </td>
                  <td className="p-3 font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                    {c.averageDailyEggs} eggs/day
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-900 dark:text-amber-400 tabular-nums text-sm">
                    {c.layingEfficiencyPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breed Production Performance Table */}
      <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Breed Yield & Shell Quality Benchmarking</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">Track which breeds produce the most consistent volume and egg weights.</p>
        </div>

        <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 font-semibold text-stone-700 dark:text-stone-200">
              <tr>
                <th className="p-3">Breed Name</th>
                <th className="p-3">Purpose & Origin</th>
                <th className="p-3">Flock Count</th>
                <th className="p-3">Egg Shell Pigment</th>
                <th className="p-3">Standard Annual Target</th>
                <th className="p-3">Avg Egg Weight</th>
                <th className="p-3 text-right">Identified Harvests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {breedPerf.map(b => (
                <tr key={b.breed.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                    {b.breed.name}
                  </td>
                  <td className="p-3 text-stone-600 dark:text-stone-300">
                    {b.breed.purpose} · {b.breed.origin}
                  </td>
                  <td className="p-3 font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                    {b.birdCount} birds
                  </td>
                  <td className="p-3 text-stone-700 dark:text-stone-300 flex items-center gap-2">
                    <EggVisual color={b.breed.eggColorType} size="small" className="w-4 h-5" />
                    <span>{b.breed.eggColorDisplay}</span>
                  </td>
                  <td className="p-3 font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                    ~{b.breed.expectedAnnualEggs} eggs/yr
                  </td>
                  <td className="p-3 font-mono text-stone-700 dark:text-stone-300 tabular-nums">
                    {b.averageEggWeight}g
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-900 dark:text-amber-400 tabular-nums text-sm">
                    {b.identifiedEggsCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
