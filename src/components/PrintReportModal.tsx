import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Coop, Chicken, EggLog } from '../types/flock';
import { computeFlockSummary, computeCoopPerformance, computeBreedPerformance, computeEggColorDistribution, computeEggSizeDistribution } from '../utils/analytics';
import { CHICKEN_BREEDS } from '../data/breeds';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  coops,
  chickens,
  eggLogs,
}) => {
  if (!isOpen) return null;

  const summary = computeFlockSummary(eggLogs, chickens);
  const coopPerf = computeCoopPerformance(coops, chickens, eggLogs);
  const breedPerf = computeBreedPerformance(eggLogs, chickens);
  const colorDist = computeEggColorDistribution(eggLogs);
  const sizeDist = computeEggSizeDistribution(eggLogs);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 print:shadow-none print:border-none print:max-h-none print:w-full transition-colors">
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between print:hidden">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Flock Performance Summary Report</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 space-y-6 text-stone-900 dark:text-stone-100 font-sans bg-white dark:bg-stone-900">
          {/* Document Header */}
          <div className="border-b-2 border-stone-800 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">Homestead Flock Performance Audit</h1>
              <p className="text-xs text-stone-500 mt-1">
                Generated October 9, 2026 · Cluck & Clutch Poultry Manager
              </p>
            </div>
            <div className="text-right text-xs text-stone-600">
              <p className="font-semibold text-stone-900">Flock Size: {chickens.length} Birds</p>
              <p>Active Layers: {summary.activeLayersCount} Hens</p>
              <p>Managed Coops: {coops.length}</p>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-stone-50 border border-stone-200 rounded-xl">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase">Today's Yield</span>
              <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">{summary.todayEggCount} eggs</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase">7-Day Lay Rate</span>
              <span className="text-xl font-bold font-mono text-amber-800 tabular-nums">{summary.average7DayLayingRatePercent}%</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase">30-Day Total</span>
              <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">{summary.totalEggsLast30Days} eggs</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase">Avg Egg Weight</span>
              <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">{summary.averageEggWeightGrams}g</span>
            </div>
          </div>

          {/* Coop Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">1. Coop Production & Housing</h3>
            <div className="border border-stone-200 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-stone-100 border-b border-stone-200 font-semibold text-stone-700">
                  <tr>
                    <th className="p-2.5">Coop Name</th>
                    <th className="p-2.5">Birds</th>
                    <th className="p-2.5">Occupancy</th>
                    <th className="p-2.5">Bedding</th>
                    <th className="p-2.5 text-right">Daily Avg</th>
                    <th className="p-2.5 text-right">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {coopPerf.map(c => (
                    <tr key={c.coop.id}>
                      <td className="p-2.5 font-medium text-stone-900">{c.coop.name}</td>
                      <td className="p-2.5 font-mono tabular-nums">{c.chickenCount} / {c.coop.capacity}</td>
                      <td className="p-2.5 font-mono tabular-nums">{c.occupancyPercent}%</td>
                      <td className="p-2.5 text-stone-600">{c.coop.beddingType}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{c.averageDailyEggs}</td>
                      <td className="p-2.5 text-right font-mono font-semibold text-amber-900 tabular-nums">{c.layingEfficiencyPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breed Productivity Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">2. Breed Breakdown</h3>
            <div className="border border-stone-200 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-stone-100 border-b border-stone-200 font-semibold text-stone-700">
                  <tr>
                    <th className="p-2.5">Breed</th>
                    <th className="p-2.5">Birds</th>
                    <th className="p-2.5">Egg Shell Color</th>
                    <th className="p-2.5">Expected Annual</th>
                    <th className="p-2.5 text-right">Identified Logs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {breedPerf.map(b => (
                    <tr key={b.breed.id}>
                      <td className="p-2.5 font-medium text-stone-900">{b.breed.name}</td>
                      <td className="p-2.5 font-mono tabular-nums">{b.birdCount}</td>
                      <td className="p-2.5 text-stone-600">{b.breed.eggColorDisplay}</td>
                      <td className="p-2.5 font-mono tabular-nums">~{b.breed.expectedAnnualEggs} eggs/yr</td>
                      <td className="p-2.5 text-right font-mono font-semibold tabular-nums">{b.identifiedEggsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Egg Quality Distributions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">3. Size Grade Distribution</h3>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5 text-xs">
                {sizeDist.map(s => (
                  <div key={s.size} className="flex justify-between items-center">
                    <span className="capitalize text-stone-700">{s.size.replace('_', ' ')}</span>
                    <span className="font-mono text-stone-900 font-semibold tabular-nums">
                      {s.count} ({s.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">4. Color Palette Breakdown</h3>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5 text-xs">
                {colorDist.filter(c => c.count > 0).map(c => (
                  <div key={c.color} className="flex justify-between items-center">
                    <span className="capitalize text-stone-700">{c.color.replace('_', ' ')}</span>
                    <span className="font-mono text-stone-900 font-semibold tabular-nums">
                      {c.count} ({c.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signoff footer */}
          <div className="pt-6 border-t border-stone-200 flex justify-between items-end text-xs text-stone-500">
            <div>
              <p>Auditor / Homestead Manager Signature: _______________________</p>
            </div>
            <div>
              <p>Certified Accurate for Farmstead Ledger</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
