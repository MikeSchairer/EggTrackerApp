import React, { useState } from 'react';
import { 
  Home, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
  Thermometer, 
  Box, 
  Bed, 
  Sparkles, 
  CheckCircle2, 
  Droplets, 
  Wind, 
  Wrench, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Layers,
  Check
} from 'lucide-react';
import { 
  Coop, 
  Chicken, 
  EggLog, 
  CoopEnvironmentLog, 
  CoopMaintenanceItem 
} from '../../types/flock';
import { CHICKEN_BREEDS } from '../../data/breeds';

interface CoopsTabProps {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  coopEnvLogs?: CoopEnvironmentLog[];
  coopMaintenanceItems?: CoopMaintenanceItem[];
  onOpenAddCoop: () => void;
  onEditCoop: (coop: Coop) => void;
  onDeleteCoop: (coopId: string) => void;
  onTransferChicken: (chickenId: string, targetCoopId: string) => void;
  onCleanCoop: (coopId: string) => void;
  onSaveEnvLog?: (log: CoopEnvironmentLog) => void;
  onToggleMaintenance?: (taskId: string) => void;
  onSaveMaintenanceTask?: (task: CoopMaintenanceItem) => void;
}

export const CoopsTab: React.FC<CoopsTabProps> = ({
  coops,
  chickens,
  eggLogs,
  coopEnvLogs = [],
  coopMaintenanceItems = [],
  onOpenAddCoop,
  onEditCoop,
  onDeleteCoop,
  onTransferChicken,
  onCleanCoop,
  onSaveEnvLog,
  onToggleMaintenance,
  onSaveMaintenanceTask,
}) => {
  const [selectedCoopId, setSelectedCoopId] = useState<string>(coops[0]?.id || '');
  const [activeSubView, setActiveSubView] = useState<'overview' | 'environment' | 'maintenance'>('overview');

  // Environment Log Form State
  const [isEnvModalOpen, setIsEnvModalOpen] = useState<boolean>(false);
  const [envTemp, setEnvTemp] = useState<number>(64);
  const [envHumidity, setEnvHumidity] = useState<number>(55);
  const [envVentilation, setEnvVentilation] = useState<CoopEnvironmentLog['ventilationLevel']>('optimal');
  const [envNotes, setEnvNotes] = useState<string>('');

  // Maintenance Task Modal State
  const [isMaintModalOpen, setIsMaintModalOpen] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string>('');
  const [taskCategory, setTaskCategory] = useState<CoopMaintenanceItem['category']>('feeder_waterer');
  const [taskFrequencyDays, setTaskFrequencyDays] = useState<number>(7);

  // Local state for interactive checkboxes if callbacks not passed
  const [localMaintState, setLocalMaintState] = useState<Record<string, boolean>>({});
  const [localEnvLogs, setLocalEnvLogs] = useState<CoopEnvironmentLog[]>(coopEnvLogs);

  const activeCoop = coops.find(c => c.id === selectedCoopId) || coops[0];
  const coopChickens = activeCoop ? chickens.filter(c => c.coopId === activeCoop.id) : [];

  // Cleaning calculation
  const getDaysSinceClean = (dateStr: string) => {
    try {
      const last = new Date(dateStr).getTime();
      const now = new Date().getTime();
      return Math.max(0, Math.floor((now - last) / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  };

  // Environmental logs for active coop
  const currentCoopEnvLogs = localEnvLogs
    .filter(l => l.coopId === activeCoop?.id)
    .sort((a, b) => new Date(`${b.date}T${b.time || '12:00'}`).getTime() - new Date(`${a.date}T${a.time || '12:00'}`).getTime());

  // Maintenance items for active coop
  const currentCoopMaintTasks = coopMaintenanceItems.filter(m => m.coopId === activeCoop?.id);

  const handleToggleTask = (taskId: string) => {
    if (onToggleMaintenance) {
      onToggleMaintenance(taskId);
    } else {
      setLocalMaintState(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    }
  };

  const handleSaveEnvLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCoop) return;

    const newLog: CoopEnvironmentLog = {
      id: `env-${Date.now()}`,
      coopId: activeCoop.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      temperatureF: envTemp,
      humidityPercent: envHumidity,
      ventilationLevel: envVentilation,
      notes: envNotes.trim() || undefined,
    };

    if (onSaveEnvLog) {
      onSaveEnvLog(newLog);
    } else {
      setLocalEnvLogs(prev => [newLog, ...prev]);
    }

    setEnvNotes('');
    setIsEnvModalOpen(false);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCoop || !taskName.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + taskFrequencyDays);

    const newTask: CoopMaintenanceItem = {
      id: `maint-${Date.now()}`,
      coopId: activeCoop.id,
      taskName: taskName.trim(),
      category: taskCategory,
      frequencyDays: taskFrequencyDays,
      lastCompletedDate: todayStr,
      nextDueDate: nextDate.toISOString().split('T')[0],
      completed: false,
    };

    if (onSaveMaintenanceTask) {
      onSaveMaintenanceTask(newTask);
    }
    setTaskName('');
    setIsMaintModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Coop Facilities & Housing Management
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Monitor capacity, run dimensions, roost space, bedding hygiene, feeders/waterers maintenance, and ventilation logs.
          </p>
        </div>

        <button
          onClick={onOpenAddCoop}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Coop</span>
        </button>
      </div>

      {/* Coop Selector Cards */}
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
                  ? 'border-amber-500 dark:border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-500/50'
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
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{coop.name}</h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[150px]">{coop.locationDescription}</p>
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
                <span>{coop.runSquareFeet ? `${coop.runSquareFeet} sq ft run` : `${coop.nestingBoxes} boxes`}</span>
              </div>
            </div>
          );
        })}
      </div>

      {activeCoop && (
        <div className="space-y-6">
          {/* Sub Navigation Strip */}
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
            <button
              onClick={() => setActiveSubView('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubView === 'overview'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Coop Details & Resident Birds ({coopChickens.length})</span>
            </button>

            <button
              onClick={() => setActiveSubView('environment')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubView === 'environment'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Temperature & Ventilation Logs ({currentCoopEnvLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveSubView('maintenance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubView === 'maintenance'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Feeders, Waterers & Maintenance ({currentCoopMaintTasks.length})</span>
            </button>
          </div>

          {/* VIEW 1: OVERVIEW & RUN DETAILS */}
          {activeSubView === 'overview' && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: activeCoop.colorTheme }}
                  >
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{activeCoop.name}</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{activeCoop.locationDescription}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCleanCoop(activeCoop.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Log Cleaning Done Today</span>
                  </button>
                  <button
                    onClick={() => onEditCoop(activeCoop)}
                    className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 5-Metric Details Grid: Nesting Boxes, Roosts, Run Details, Bedding, Temp */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase block mb-1">Nesting Boxes</span>
                  <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                    {activeCoop.nestingBoxes}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    1 box per {Math.round((coopChickens.length / Math.max(1, activeCoop.nestingBoxes)) * 10) / 10} hens
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase block mb-1">Roost Length</span>
                  <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                    {activeCoop.roostLengthFeet} ft
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    ~{Math.round(((activeCoop.roostLengthFeet * 12) / Math.max(1, coopChickens.length)) * 10) / 10}" per bird
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase block mb-1">Run Space & Mesh</span>
                  <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                    {activeCoop.runSquareFeet || 120} sq ft
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {activeCoop.predatorMeshType || '1/2" Hardware Cloth'}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase block mb-1">Bedding Hygiene</span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">
                    {activeCoop.beddingType}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Cleaned: {activeCoop.lastCleanedDate}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase block mb-1">Target Temp</span>
                  <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                    {activeCoop.targetTempFahrenheit || 65}°F
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">Natural ventilation</p>
                </div>
              </div>

              {/* Resident Birds Directory */}
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
                    No chickens assigned to this coop currently.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {coopChickens.map(chicken => {
                      const breed = CHICKEN_BREEDS.find(b => b.id === chicken.breedId);

                      return (
                        <div
                          key={chicken.id}
                          className="p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl space-y-2 text-xs"
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

                            {coops.length > 1 && (
                              <div className="flex items-center gap-1">
                                <span className="text-stone-400">Move:</span>
                                <select
                                  value={chicken.coopId}
                                  onChange={e => onTransferChicken(chicken.id, e.target.value)}
                                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-1.5 py-0.5 text-[11px]"
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
            </div>
          )}

          {/* VIEW 2: TEMPERATURE, HUMIDITY & VENTILATION LOGS */}
          {activeSubView === 'environment' && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                    <span>Environmental & Ventilation History</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    High humidity causes frostbite on wattles in winter; good ridge ventilation keeps ammonia under 10 ppm.
                  </p>
                </div>

                <button
                  onClick={() => setIsEnvModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Coop Reading</span>
                </button>
              </div>

              {currentCoopEnvLogs.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-500">
                  No temperature or ventilation logs recorded for this coop yet. Click "Log Coop Reading" to add morning or evening observations.
                </div>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {currentCoopEnvLogs.map(log => (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0">
                          <Wind className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 dark:text-stone-100">{log.date}</span>
                            {log.time && <span className="text-stone-400 font-mono">({log.time})</span>}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              log.ventilationLevel === 'optimal' 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {log.ventilationLevel.replace('_', ' ')}
                            </span>
                          </div>
                          {log.notes && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{log.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-mono text-base font-bold text-stone-900 dark:text-stone-100">
                            {log.temperatureF}°F
                          </span>
                          <span className="text-[10px] text-stone-400 block">Temperature</span>
                        </div>
                        <div>
                          <span className="font-mono text-base font-bold text-stone-900 dark:text-stone-100">
                            {log.humidityPercent}%
                          </span>
                          <span className="text-[10px] text-stone-400 block">Humidity</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: FEEDERS, WATERERS & EQUIPMENT MAINTENANCE */}
          {activeSubView === 'maintenance' && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Feeders, Waterers & Equipment Maintenance Schedule</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Recurring sanitation routines for drinkers, auto-doors, predator netting, and roost hygiene.
                  </p>
                </div>

                <button
                  onClick={() => setIsMaintModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Maintenance Routine</span>
                </button>
              </div>

              {currentCoopMaintTasks.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-500">
                  No maintenance items assigned to this coop. Add tasks such as water fount sanitizing or hardware cloth inspection.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentCoopMaintTasks.map(task => {
                    const isCompleted = localMaintState[task.id] !== undefined 
                      ? localMaintState[task.id] 
                      : task.completed;

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                          isCompleted
                            ? 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 opacity-75'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-stone-300 dark:border-stone-600 hover:border-amber-600'
                            }`}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div>
                            <span className={`font-bold block ${isCompleted ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                              {task.taskName}
                            </span>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">
                              Every {task.frequencyDays} days · Last completed {task.lastCompletedDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            Due {task.nextDueDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Log Environmental Reading Modal */}
      {isEnvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Log Coop Environment Reading
            </h3>
            <form onSubmit={handleSaveEnvLog} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block text-stone-700 dark:text-stone-300 mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  value={envTemp}
                  onChange={e => setEnvTemp(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block text-stone-700 dark:text-stone-300 mb-1">Humidity (%)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={envHumidity}
                  onChange={e => setEnvHumidity(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block text-stone-700 dark:text-stone-300 mb-1">Ventilation Assessment</label>
                <select
                  value={envVentilation}
                  onChange={e => setEnvVentilation(e.target.value as any)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-2"
                >
                  <option value="optimal">Optimal (Fresh air without drafts)</option>
                  <option value="drafty">Drafty (Floor airflow needs baffle)</option>
                  <option value="stuffy">Stuffy (Moisture/ammonia buildup)</option>
                  <option value="closed_freeze">Closed for Freeze (Storm mode)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block text-stone-700 dark:text-stone-300 mb-1">Observation Notes</label>
                <textarea
                  value={envNotes}
                  onChange={e => setEnvNotes(e.target.value)}
                  placeholder="e.g. Ridge vents adjusted, water unfrozen..."
                  rows={2}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnvModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Maintenance Task Modal */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Add Coop Equipment Maintenance Routine
            </h3>
            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block text-stone-700 dark:text-stone-300 mb-1">Routine Task Name</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                  placeholder="e.g. Disinfect Bell Drinkers & Replace Heated Base"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block text-stone-700 dark:text-stone-300 mb-1">Category</label>
                <select
                  value={taskCategory}
                  onChange={e => setTaskCategory(e.target.value as any)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-2"
                >
                  <option value="feeder_waterer">Drinkers & Feeders</option>
                  <option value="security">Security & Doors</option>
                  <option value="cleaning">Hygiene & Sanitizing</option>
                  <option value="bedding">Bedding & Litter Turn</option>
                  <option value="repairs">Structure & Hardware</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block text-stone-700 dark:text-stone-300 mb-1">Frequency (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={taskFrequencyDays}
                  onChange={e => setTaskFrequencyDays(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold cursor-pointer"
                >
                  Add Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
