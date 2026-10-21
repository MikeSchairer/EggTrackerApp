import React, { useState } from 'react';
import { 
  Egg, 
  Calendar, 
  Thermometer, 
  Droplets, 
  RotateCw, 
  Eye, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award 
} from 'lucide-react';
import { IncubationBatch, CandlingRecord } from '../../types/flock';
import { calculateIncubationSchedule } from '../../utils/flockCalculations';
import { getTodayDateStr } from '../../utils/dateUtils';

interface IncubationTabProps {
  batches: IncubationBatch[];
  onSaveBatch: (batch: IncubationBatch) => void;
}

export const IncubationTab: React.FC<IncubationTabProps> = ({
  batches,
  onSaveBatch,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches.length > 0 ? batches[0].id : ''
  );
  const [isNewBatchOpen, setIsNewBatchOpen] = useState<boolean>(false);
  const [isCandlingModalOpen, setIsCandlingModalOpen] = useState<boolean>(false);
  const [isHatchModalOpen, setIsHatchModalOpen] = useState<boolean>(false);

  // New batch form state
  const [batchName, setBatchName] = useState<string>('Spring Heritage Clutch');
  const [incubatorModel, setIncubatorModel] = useState<string>('Forced Air Digital Incubator');
  const [settingDate, setSettingDate] = useState<string>(() => getTodayDateStr());
  const [eggsSetCount, setEggsSetCount] = useState<number>(12);
  const [targetTempF, setTargetTempF] = useState<number>(99.5);
  const [targetHumidity, setTargetHumidity] = useState<number>(48);
  const [batchNotes, setBatchNotes] = useState<string>('');

  // Candling form state
  const [candlingDay, setCandlingDay] = useState<number>(7);
  const [fertileCount, setFertileCount] = useState<number>(10);
  const [clearCount, setClearCount] = useState<number>(2);
  const [bloodRingCount, setBloodRingCount] = useState<number>(0);
  const [quitterCount, setQuitterCount] = useState<number>(0);
  const [candlingNotes, setCandlingNotes] = useState<string>('');

  // Hatch outcome form state
  const [hatchedCount, setHatchedCount] = useState<number>(10);
  const [unhatchedCount, setUnhatchedCount] = useState<number>(2);
  const [pippedCount, setPippedCount] = useState<number>(0);

  const activeBatch = batches.find(b => b.id === selectedBatchId) || batches[0];

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule = calculateIncubationSchedule(settingDate);
    const newBatch: IncubationBatch = {
      id: `incub-${Date.now()}`,
      batchName: batchName.trim() || 'Incubation Clutch',
      incubatorModel: incubatorModel.trim() || undefined,
      settingDate,
      expectedHatchDate: schedule.hatchDate,
      lockdownDate: schedule.lockdownDate,
      eggsSetCount: Number(eggsSetCount),
      targetTempF: Number(targetTempF),
      targetHumidityPercent: Number(targetHumidity),
      dailyTurnings: [{ date: getTodayDateStr(), turnsCount: 3 }],
      candlingRecords: [],
      status: 'incubating',
      notes: batchNotes.trim() || undefined,
    };

    onSaveBatch(newBatch);
    setSelectedBatchId(newBatch.id);
    setIsNewBatchOpen(false);
  };

  const handleLogTurning = (batch: IncubationBatch) => {
    const todayStr = getTodayDateStr();
    const turnings = [...batch.dailyTurnings];
    const todayIndex = turnings.findIndex(t => t.date === todayStr);

    if (todayIndex >= 0) {
      turnings[todayIndex] = {
        ...turnings[todayIndex],
        turnsCount: turnings[todayIndex].turnsCount + 1,
      };
    } else {
      turnings.push({ date: todayStr, turnsCount: 1 });
    }

    onSaveBatch({
      ...batch,
      dailyTurnings: turnings,
    });
  };

  const handleSaveCandling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;

    const record: CandlingRecord = {
      day: Number(candlingDay),
      date: getTodayDateStr(),
      fertileCount: Number(fertileCount),
      clearInfertileCount: Number(clearCount),
      bloodRingCount: Number(bloodRingCount),
      quitterCount: Number(quitterCount),
      notes: candlingNotes.trim() || undefined,
    };

    const existing = activeBatch.candlingRecords.filter(r => r.day !== record.day);
    onSaveBatch({
      ...activeBatch,
      candlingRecords: [...existing, record].sort((a, b) => a.day - b.day),
    });
    setIsCandlingModalOpen(false);
  };

  const handleSaveHatchOutcomes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;

    onSaveBatch({
      ...activeBatch,
      outcomes: {
        hatched: Number(hatchedCount),
        unhatched: Number(unhatchedCount),
        pippedNotHatched: Number(pippedCount),
      },
      status: 'completed',
    });
    setIsHatchModalOpen(false);
  };

  if (!activeBatch) {
    return (
      <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700">
          <Egg className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">No Incubation Batches Active</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Start an incubation clutch to automatically track candling milestones, lockdown timing, turning logs, and hatch success rates.
        </p>
        <button
          onClick={() => setIsNewBatchOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl"
        >
          Start Incubation Batch
        </button>
      </div>
    );
  }

  const schedule = calculateIncubationSchedule(activeBatch.settingDate);
  const todayTurning = activeBatch.dailyTurnings.find(
    t => t.date === getTodayDateStr()
  );
  const turnsToday = todayTurning ? todayTurning.turnsCount : 0;

  // Hatch rate calculation
  const hatchRate = activeBatch.outcomes
    ? Math.round((activeBatch.outcomes.hatched / Math.max(1, activeBatch.eggsSetCount)) * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Egg className="w-6 h-6 text-amber-700 dark:text-amber-500" />
            Egg Incubation Calculator & Hatch Tracker
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            21-day milestone automation, candling fertility logs, temperature & humidity targets, and hatch outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {batches.length > 1 && (
            <select
              value={activeBatch.id}
              onChange={e => setSelectedBatchId(e.target.value)}
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.batchName}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsNewBatchOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Batch
          </button>
        </div>
      </div>

      {/* Main 21-Day Countdown & Progress Card */}
      <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {activeBatch.batchName}
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                activeBatch.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : schedule.currentDay >= 18
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
              }`}>
                {schedule.statusText}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Set on <strong>{activeBatch.settingDate}</strong> · Incubator: {activeBatch.incubatorModel || 'Standard Incubator'} · Total: <strong>{activeBatch.eggsSetCount} eggs</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-400 block uppercase font-bold">Estimated Hatch Day</span>
            <span className="text-xl font-extrabold font-mono text-amber-700 dark:text-amber-400">
              {schedule.hatchDate}
            </span>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {schedule.daysRemaining > 0 ? `${schedule.daysRemaining} days remaining` : 'Hatch window open'}
            </p>
          </div>
        </div>

        {/* 21-Day Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-medium">Incubation Cycle Timeline</span>
            <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
              Day {schedule.currentDay} / 21 ({schedule.percentComplete}%)
            </span>
          </div>

          <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-500 rounded-full"
              style={{ width: `${schedule.percentComplete}%` }}
            />
          </div>

          {/* Key Milestones Strip */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-[11px] text-stone-600 dark:text-stone-400">
            <div className={`p-2 rounded-lg border ${schedule.currentDay >= 1 ? 'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30' : 'border-stone-200 dark:border-stone-800'}`}>
              <strong className="block text-stone-900 dark:text-stone-100">Day 1: Set Date</strong>
              <span>{activeBatch.settingDate}</span>
            </div>
            <div className={`p-2 rounded-lg border ${schedule.currentDay >= 7 ? 'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30' : 'border-stone-200 dark:border-stone-800'}`}>
              <strong className="block text-stone-900 dark:text-stone-100">Day 7: Candling 1</strong>
              <span>{schedule.candlingDay7}</span>
            </div>
            <div className={`p-2 rounded-lg border ${schedule.currentDay >= 14 ? 'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30' : 'border-stone-200 dark:border-stone-800'}`}>
              <strong className="block text-stone-900 dark:text-stone-100">Day 14: Candling 2</strong>
              <span>{schedule.candlingDay14}</span>
            </div>
            <div className={`p-2 rounded-lg border ${schedule.currentDay >= 18 ? 'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30' : 'border-stone-200 dark:border-stone-800'}`}>
              <strong className="block text-stone-900 dark:text-stone-100">Day 18: Lockdown</strong>
              <span>{schedule.lockdownDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Parameters & Turning Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Temperature */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Target Temperature</span>
            <Thermometer className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {activeBatch.targetTempF}°F
            </span>
            <span className="text-xs text-stone-500">(37.5°C)</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Forced air standard: 99.5°F constant. (Still air: 101.5°F at egg level).
          </p>
        </div>

        {/* Humidity */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Target Humidity</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {schedule.currentDay >= 18 ? '65%–70%' : `${activeBatch.targetHumidityPercent}%`}
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            {schedule.currentDay >= 18
              ? 'Lockdown: Elevate humidity to 65-70% to soften chick egg membranes.'
              : 'Days 1-17: Maintain 45-50% for optimal air cell evaporation.'}
          </p>
        </div>

        {/* Turning Counter */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Today's Turning Log</span>
              <RotateCw className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
                {turnsToday}
              </span>
              <span className="text-xs font-semibold text-stone-500">turns logged today</span>
            </div>
          </div>

          <div className="pt-2">
            {schedule.currentDay >= 18 ? (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
                ⛔ Lockdown Active: Do not turn eggs!
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleLogTurning(activeBatch)}
                className="w-full py-1.5 px-3 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                +1 Egg Turn Logged
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candling Logs & Hatch Outcomes Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candling & Fertility Card */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                Fertility Checks & Candling Logs
              </h3>
              <p className="text-xs text-stone-500">
                Verify spider veins on Day 7 and air cell development on Day 14.
              </p>
            </div>

            <button
              onClick={() => setIsCandlingModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Candling
            </button>
          </div>

          {activeBatch.candlingRecords.length === 0 ? (
            <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-xl text-center text-xs text-stone-500">
              No candling logs recorded yet. Recommended check on Day 7 ({schedule.candlingDay7}).
            </div>
          ) : (
            <div className="space-y-3">
              {activeBatch.candlingRecords.map(rec => (
                <div
                  key={rec.day}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      Day {rec.day} Candling Inspection ({rec.date})
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {rec.fertileCount} Fertile / Developing
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-1.5 bg-white dark:bg-stone-800 rounded border border-stone-200/80 dark:border-stone-700">
                      <span className="text-stone-400 block">Fertile:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{rec.fertileCount}</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-stone-800 rounded border border-stone-200/80 dark:border-stone-700">
                      <span className="text-stone-400 block">Clear (Infertile):</span>
                      <strong className="text-stone-700 dark:text-stone-300 font-mono">{rec.clearInfertileCount}</strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-stone-800 rounded border border-stone-200/80 dark:border-stone-700">
                      <span className="text-stone-400 block">Quitters/Rings:</span>
                      <strong className="text-red-700 dark:text-red-400 font-mono">{rec.bloodRingCount + rec.quitterCount}</strong>
                    </div>
                  </div>

                  {rec.notes && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                      "{rec.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hatch Outcomes Card */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Hatch Outcomes & Success Rate
              </h3>
              <p className="text-xs text-stone-500">
                Final clutch audit of successfully hatched chicks.
              </p>
            </div>

            <button
              onClick={() => setIsHatchModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {activeBatch.outcomes ? 'Edit Hatch' : 'Record Hatch Results'}
            </button>
          </div>

          {activeBatch.outcomes ? (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                  Hatch Completed!
                </span>
                <span className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                  {hatchRate}% Success
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200/80">
                  <span className="text-stone-400 text-[10px] block uppercase">Chicks Hatched</span>
                  <strong className="text-emerald-700 font-mono text-base">{activeBatch.outcomes.hatched}</strong>
                </div>
                <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200/80">
                  <span className="text-stone-400 text-[10px] block uppercase">Unhatched</span>
                  <strong className="text-stone-700 font-mono text-base">{activeBatch.outcomes.unhatched}</strong>
                </div>
                <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200/80">
                  <span className="text-stone-400 text-[10px] block uppercase">Pipped Unhatched</span>
                  <strong className="text-stone-700 font-mono text-base">{activeBatch.outcomes.pippedNotHatched}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-xl text-center text-xs text-stone-500 space-y-2">
              <p>Hatch results will be recorded upon Day 21 emergence.</p>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold block">
                Expected hatch date: {schedule.hatchDate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* New Incubation Batch Modal */}
      {isNewBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Egg className="w-5 h-5 text-amber-700" />
                Start New Egg Incubation Batch
              </h2>
              <button
                type="button"
                onClick={() => setIsNewBatchOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  placeholder="e.g. Polish & Wyandotte Spring Hatch"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Setting Date (Day 1) *
                  </label>
                  <input
                    type="date"
                    required
                    value={settingDate}
                    onChange={e => setSettingDate(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Eggs Set (Count) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={eggsSetCount}
                    onChange={e => setEggsSetCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Target Temp (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetTempF}
                    onChange={e => setTargetTempF(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Target Humidity (%)
                  </label>
                  <input
                    type="number"
                    value={targetHumidity}
                    onChange={e => setTargetHumidity(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Incubator Model / Hardware
                </label>
                <input
                  type="text"
                  value={incubatorModel}
                  onChange={e => setIncubatorModel(e.target.value)}
                  placeholder="e.g. Brinsea Ovation, Nurture Right 360"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Breeds / Notes
                </label>
                <textarea
                  rows={2}
                  value={batchNotes}
                  onChange={e => setBatchNotes(e.target.value)}
                  placeholder="e.g. 6 Silver Laced Wyandotte + 6 Polish eggs."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsNewBatchOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl"
                >
                  Start 21-Day Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Candling Modal */}
      {isCandlingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-700" />
                Record Candling Results
              </h2>
              <button
                type="button"
                onClick={() => setIsCandlingModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCandling} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Candling Stage
                </label>
                <select
                  value={candlingDay}
                  onChange={e => setCandlingDay(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                >
                  <option value={7}>Day 7 Inspection (Initial Spider Veins & Eye Spot)</option>
                  <option value={14}>Day 14 Inspection (Active Movement & Expanding Air Cell)</option>
                  <option value={18}>Day 18 Lockdown Inspection (Full Shadow & Air Cell Drawdown)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Fertile / Developing
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fertileCount}
                    onChange={e => setFertileCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Clear (Infertile)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={clearCount}
                    onChange={e => setClearCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Blood Rings (Early Quitters)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bloodRingCount}
                    onChange={e => setBloodRingCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Late Quitters
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quitterCount}
                    onChange={e => setQuitterCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Candling Observations
                </label>
                <textarea
                  rows={2}
                  value={candlingNotes}
                  onChange={e => setCandlingNotes(e.target.value)}
                  placeholder="e.g. Strong embryo movement detected in 10 eggs."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCandlingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl"
                >
                  Save Candling Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hatch Outcomes Modal */}
      {isHatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Record Final Hatch Results
              </h2>
              <button
                type="button"
                onClick={() => setIsHatchModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHatchOutcomes} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Hatched Chicks *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={hatchedCount}
                    onChange={e => setHatchedCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Unhatched
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={unhatchedCount}
                    onChange={e => setUnhatchedCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Pipped
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pippedCount}
                    onChange={e => setPippedCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl text-xs text-stone-600 dark:text-stone-400">
                <span>Calculated Hatch Rate: </span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                  {Math.round((hatchedCount / Math.max(1, activeBatch.eggsSetCount)) * 100)}%
                </strong>
                <span className="block text-[11px] text-stone-400 mt-0.5">
                  Based on {activeBatch.eggsSetCount} eggs originally set.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsHatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
                >
                  Complete & Archive Hatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
