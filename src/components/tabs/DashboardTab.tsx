import React, { useState, useEffect, useMemo } from 'react';
import { 
  Egg, 
  Plus, 
  TrendingUp, 
  Home, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Wheat, 
  HeartPulse, 
  ShieldCheck, 
  Sun, 
  CloudSun, 
  Sparkles, 
  Check, 
  RefreshCw,
  Bell,
  Feather,
  Pencil,
  Globe,
  PlusCircle,
  RotateCcw,
  ListTodo,
  ExternalLink
} from 'lucide-react';
import { 
  Coop, 
  Chicken, 
  EggLog, 
  FeedItem, 
  HealthRecord, 
  SmartReminder, 
  IncubationBatch 
} from '../../types/flock';
import { computeFlockSummary } from '../../utils/analytics';
import { 
  calculateSeasonalLayingPredictions, 
  calculateFeedDaysRemaining, 
  getWeatherCareAdvisories 
} from '../../utils/flockCalculations';
import { getTodayDateStr, getCurrentDateTimePreview, formatDisplayDate } from '../../utils/dateUtils';
import { EggVisual } from '../EggVisual';
import { DailyEggCountsBarGraph } from '../DailyEggCountsBarGraph';
import { ChickenAvatar } from '../ChickenAvatar';
import { CHICKEN_BREEDS } from '../../data/breeds';

interface DashboardTabProps {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  feedInventory?: FeedItem[];
  healthRecords?: HealthRecord[];
  reminders?: SmartReminder[];
  incubationBatches?: IncubationBatch[];
  timezone?: string;
  onOpenLogEggs: () => void;
  onEditEggLog?: (log: EggLog) => void;
  onOpenAddChicken: () => void;
  onSelectCoop: (coopId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onSelectHealthSubTab?: (subTab: 'health' | 'weather' | 'predators' | 'lockdown') => void;
  onToggleReminder?: (reminderId: string) => void;
  onOpenTimeZoneModal?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  coops,
  chickens,
  eggLogs,
  feedInventory = [],
  healthRecords = [],
  reminders = [],
  incubationBatches = [],
  timezone,
  onOpenLogEggs,
  onEditEggLog,
  onOpenAddChicken,
  onSelectCoop,
  onNavigateToTab,
  onSelectHealthSubTab,
  onToggleReminder,
  onOpenTimeZoneModal,
}) => {
  // Configured or detected homestead timezone
  const todayDate = useMemo(() => getTodayDateStr(timezone), [timezone]);
  const currentTimePreview = useMemo(() => getCurrentDateTimePreview(timezone), [timezone]);

  // Today's eggs calculation using local homestead calendar day
  const todayLogs = useMemo(() => eggLogs.filter(l => l.date === todayDate), [eggLogs, todayDate]);
  const todayEggCount = useMemo(() => todayLogs.reduce((sum, l) => sum + l.totalEggs, 0), [todayLogs]);
  const todayBrokenCount = useMemo(() => todayLogs.reduce((sum, l) => sum + l.brokenCount, 0), [todayLogs]);
  const todayIntactCount = Math.max(0, todayEggCount - todayBrokenCount);

  // Flock summary metrics calculated for today's local date
  const summary = useMemo(() => computeFlockSummary(eggLogs, chickens, todayDate, timezone), [eggLogs, chickens, todayDate, timezone]);

  // Daily chore completion map for todayDate
  const todayStorageKey = `flocker_daily_chores_done_${todayDate}`;
  const [completedChoresMap, setCompletedChoresMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(todayStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Synchronize completed chores when todayDate changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(todayStorageKey);
      setCompletedChoresMap(saved ? JSON.parse(saved) : {});
    } catch {
      setCompletedChoresMap({});
    }
  }, [todayDate, todayStorageKey]);

  // Custom user chores persisted in localStorage
  const [customChores, setCustomChores] = useState<Array<{ id: string; title: string; timeOfDay: string; priority: 'routine' | 'urgent'; notes?: string }>>(() => {
    try {
      const saved = localStorage.getItem('flocker_custom_homestead_chores');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state for adding chore
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreTime, setNewChoreTime] = useState('Morning');
  const [newChorePriority, setNewChorePriority] = useState<'routine' | 'urgent'>('routine');
  const [choreFilter, setChoreFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Toggle chore completion
  const handleToggleChore = (choreId: string) => {
    setCompletedChoresMap(prev => {
      const next = { ...prev, [choreId]: !prev[choreId] };
      try {
        localStorage.setItem(todayStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (onToggleReminder && reminders.some(r => r.id === choreId)) {
      onToggleReminder(choreId);
    }
  };

  const handleResetTodayChores = () => {
    if (window.confirm("Reset all homestead routines for today to pending?")) {
      setCompletedChoresMap({});
      try {
        localStorage.removeItem(todayStorageKey);
      } catch {}
    }
  };

  const handleAddCustomChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreTitle.trim()) return;

    const newChore = {
      id: `custom-chore-${Date.now()}`,
      title: newChoreTitle.trim(),
      timeOfDay: newChoreTime,
      priority: newChorePriority,
    };

    const next = [...customChores, newChore];
    setCustomChores(next);
    try {
      localStorage.setItem('flocker_custom_homestead_chores', JSON.stringify(next));
    } catch {}

    setNewChoreTitle('');
    setIsAddChoreOpen(false);
  };

  const handleDeleteCustomChore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = customChores.filter(c => c.id !== id);
    setCustomChores(next);
    try {
      localStorage.setItem('flocker_custom_homestead_chores', JSON.stringify(next));
    } catch {}
  };

  // Recent 5 logs
  const recentLogs = useMemo(() => {
    return [...eggLogs]
      .sort((a, b) => new Date(`${b.date}T${b.time || '12:00'}`).getTime() - new Date(`${a.date}T${a.time || '12:00'}`).getTime())
      .slice(0, 5);
  }, [eggLogs]);

  const coopMap = useMemo(() => new Map(coops.map(c => [c.id, c])), [coops]);

  // Active layers & molting count
  const moltingCount = useMemo(() => chickens.filter(c => c.lifeStage === 'molting').length, [chickens]);
  const recentDailyAvg = summary.totalEggsLast7Days / 7;
  const seasonalPrediction = calculateSeasonalLayingPredictions(
    summary.activeLayersCount,
    moltingCount,
    recentDailyAvg
  );

  // Feed status
  const totalLayerFeedLbs = useMemo(() => {
    return feedInventory
      .filter(f => f.category === 'layer_feed')
      .reduce((sum, f) => sum + f.currentQuantityLbs, 0);
  }, [feedInventory]);
  
  const feedDaysLeft = calculateFeedDaysRemaining(totalLayerFeedLbs, summary.totalFlockCount);
  const lowStockFeedItems = useMemo(() => {
    return feedInventory.filter(f => f.currentQuantityLbs <= f.lowStockThresholdLbs);
  }, [feedInventory]);

  // Health checks due or monitoring
  const activeHealthMonitoring = useMemo(() => {
    return healthRecords.filter(r => r.outcome === 'monitoring' || r.outcome === 'recovering');
  }, [healthRecords]);

  // Weather advisory (simulated 64F pleasant autumn)
  const weatherAdvisory = useMemo(() => getWeatherCareAdvisories(64), []);

  // Unified Homestead Chores List (Standard Routines + Smart Alerts + User Tasks)
  const allChores = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      timeOfDay: string;
      category: 'water' | 'eggs' | 'feed' | 'security' | 'health' | 'custom';
      priority: 'routine' | 'urgent';
      completed: boolean;
      actionLabel?: string;
      onAction?: () => void;
      description: string;
      isCustom?: boolean;
    }> = [
      {
        id: 'routine-water',
        title: 'Morning Coop Release & Fresh Water',
        timeOfDay: 'Morning',
        category: 'water',
        priority: 'routine',
        completed: !!completedChoresMap['routine-water'],
        description: 'Unlatch pop doors, inspect waterers, verify drinking fonts are clean & unfrozen.',
      },
      {
        id: 'routine-eggs',
        title: "Afternoon Egg Gathering & Nest Box Check",
        timeOfDay: 'Afternoon',
        category: 'eggs',
        priority: 'routine',
        completed: todayEggCount > 0 || !!completedChoresMap['routine-eggs'],
        actionLabel: todayEggCount > 0 ? 'Log More' : 'Log Eggs',
        onAction: onOpenLogEggs,
        description: todayEggCount > 0 
          ? `✓ ${todayEggCount} fresh eggs logged today (${todayIntactCount} intact). Inspect straw in nesting boxes.` 
          : 'Collect eggs from nesting boxes to keep shells pristine and prevent broodiness.',
      },
      {
        id: 'routine-feed',
        title: 'Layer Feed & Calcium / Grit Check',
        timeOfDay: 'All Day',
        category: 'feed',
        priority: lowStockFeedItems.length > 0 ? 'urgent' : 'routine',
        completed: !!completedChoresMap['routine-feed'],
        actionLabel: 'Feed Inventory',
        onAction: () => onNavigateToTab('feed'),
        description: lowStockFeedItems.length > 0
          ? `⚠️ ${lowStockFeedItems[0].name} is low on stock (${lowStockFeedItems[0].currentQuantityLbs} lbs remaining). Refill hopper.`
          : `Verify layer pellet hoppers flow freely (${feedDaysLeft > 0 ? `${feedDaysLeft} days supply remaining` : 'Check stock'}).`,
      },
      {
        id: 'routine-lockdown',
        title: 'Evening Roost Headcount & Night Lockdown',
        timeOfDay: 'Dusk / Evening',
        category: 'security',
        priority: 'routine',
        completed: !!completedChoresMap['routine-lockdown'],
        actionLabel: 'Lockdown Checklist',
        onAction: () => onSelectHealthSubTab ? onSelectHealthSubTab('lockdown') : onNavigateToTab('health'),
        description: 'Count all birds on roost bars, close pop doors, and secure predator-proof locks.',
      },
    ];

    // Dynamic smart alerts from real flock conditions
    if (activeHealthMonitoring.length > 0) {
      list.push({
        id: `smart-health-${activeHealthMonitoring[0].id}`,
        title: `Patient Follow-up: ${activeHealthMonitoring[0].title}`,
        timeOfDay: 'Morning / Noon',
        category: 'health',
        priority: 'urgent',
        completed: !!completedChoresMap[`smart-health-${activeHealthMonitoring[0].id}`],
        actionLabel: 'Health Dossier',
        onAction: () => onNavigateToTab('health'),
        description: `Inspect recovery progress and administer any prescribed treatments (${activeHealthMonitoring[0].outcome}).`,
      });
    }

    if (moltingCount > 0) {
      list.push({
        id: 'smart-molting',
        title: `Feather Molt Protein Boost (${moltingCount} birds)`,
        timeOfDay: 'Midday',
        category: 'health',
        priority: 'routine',
        completed: !!completedChoresMap['smart-molting'],
        description: 'Provide high-protein scratch, black soldier fly larvae, or mealworms to support regrowing feathers.',
      });
    }

    // Custom homestead chores
    customChores.forEach(c => {
      list.push({
        id: c.id,
        title: c.title,
        timeOfDay: c.timeOfDay,
        category: 'custom',
        priority: c.priority,
        completed: !!completedChoresMap[c.id],
        description: c.notes || 'Custom homestead chore.',
        isCustom: true,
      });
    });

    // Reminders from state
    reminders.forEach(r => {
      if (!list.some(item => item.id === r.id)) {
        list.push({
          id: r.id,
          title: r.title,
          timeOfDay: 'Scheduled',
          category: 'custom',
          priority: r.priority === 'urgent' ? 'urgent' : 'routine',
          completed: r.completed || !!completedChoresMap[r.id],
          description: r.notes || `Chore due ${r.dueDate || 'today'}.`,
        });
      }
    });

    return list;
  }, [
    completedChoresMap,
    todayEggCount,
    todayIntactCount,
    lowStockFeedItems,
    feedDaysLeft,
    activeHealthMonitoring,
    moltingCount,
    customChores,
    reminders,
    onOpenLogEggs,
    onNavigateToTab,
    onSelectHealthSubTab
  ]);

  const pendingChores = useMemo(() => allChores.filter(c => !c.completed), [allChores]);
  const completedChores = useMemo(() => allChores.filter(c => c.completed), [allChores]);

  const filteredChores = useMemo(() => {
    if (choreFilter === 'pending') return pendingChores;
    if (choreFilter === 'completed') return completedChores;
    return allChores;
  }, [choreFilter, allChores, pendingChores, completedChores]);

  return (
    <div className="space-y-8">
      {/* 1. Hero Pastoral Section */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900 text-white shadow-sm">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_flock_pasture_1791579810391.jpg"
            alt="Flock pasture at morning sunrise"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-45"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/70 to-stone-900/40" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 tracking-wider uppercase mb-2">
            <span>Homestead Flock Monitor</span>
            <span>·</span>
            <span>{currentTimePreview.readableDate}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Flock health, egg production, and homestead management in one unified hub.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-200 leading-relaxed max-w-2xl">
            {chickens.length === 0 ? (
              <>Welcome to Flocker! Get started by setting up your first coop, registering your birds, and logging daily egg production.</>
            ) : (
              <>
                Currently overseeing {chickens.length} birds across {coops.length} active coops with {summary.activeLayersCount} active laying hens.
                Daily yield today is <span className="font-semibold text-amber-200">{todayEggCount} fresh eggs</span> at an estimated {summary.currentLayingRatePercent}% laying efficiency.
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenLogEggs}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Today's Eggs</span>
            </button>
            <button
              onClick={onOpenAddChicken}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Bird</span>
            </button>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>View Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            {onOpenTimeZoneModal && (
              <button
                onClick={onOpenTimeZoneModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-amber-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer ml-auto"
                title="Change Homestead Time Zone"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentTimePreview.timeZoneName}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SMART DAILY FLOCK BRIEFING DASHBOARD */}
      <div className="p-6 bg-gradient-to-br from-amber-500/5 via-stone-50 dark:via-stone-900 to-amber-700/5 border border-amber-200/80 dark:border-stone-800 rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-amber-200/60 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Smart Daily Flock Briefing
                </h2>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Today's Status
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {currentTimePreview.readableDate} · {currentTimePreview.readableTime}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Instant answers to homestead morning questions & single-tap actions.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons & Timezone indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenTimeZoneModal && (
              <button
                type="button"
                onClick={onOpenTimeZoneModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
                title="Configure Homestead Time Zone"
              >
                <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Timezone: {timezone || currentTimePreview.timeZoneName}</span>
              </button>
            )}

            <button
              onClick={onOpenLogEggs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/80 rounded-lg transition-colors cursor-pointer"
            >
              <Egg className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Log Eggs</span>
            </button>
            <button
              onClick={() => onNavigateToTab('feed')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-950/70 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 rounded-lg transition-colors cursor-pointer"
            >
              <Wheat className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Refill Feed</span>
            </button>
            <button
              onClick={() => onNavigateToTab('health')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-900 dark:text-rose-100 bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 dark:hover:bg-rose-900/80 rounded-lg transition-colors cursor-pointer"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
              <span>Health Check</span>
            </button>
            <button
              onClick={() => onSelectHealthSubTab ? onSelectHealthSubTab('lockdown') : onNavigateToTab('health')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-900 dark:text-purple-100 bg-purple-100 dark:bg-purple-950/70 hover:bg-purple-200 dark:hover:bg-purple-900/80 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
              <span>Lockdown Checklist</span>
            </button>
          </div>
        </div>

        {/* 4 Answers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Answer 1: How many eggs collected? */}
          <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">1. Eggs Collected Today</span>
                <Egg className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                  {todayEggCount}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">eggs logged</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                {todayEggCount > 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ {todayEggCount} fresh eggs ({todayIntactCount} intact{todayBrokenCount > 0 ? `, ${todayBrokenCount} cracked` : ''})
                  </span>
                ) : (
                  <span className="text-stone-500 dark:text-stone-400">
                    No eggs logged yet today (7-day avg: {recentDailyAvg.toFixed(1)}/day)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onOpenLogEggs}
              className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{todayEggCount > 0 ? '+ Add More Eggs' : 'Log Today’s Harvest →'}</span>
            </button>
          </div>

          {/* Answer 2: Which chores are due? */}
          <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">2. Chores Due Today</span>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                  {pendingChores.length}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  of {allChores.length} pending
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 truncate mt-1">
                {pendingChores.length > 0 ? (
                  <span>Next: {pendingChores[0].title}</span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ All homestead routines complete! 🎉
                  </span>
                )}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${allChores.length > 0 ? Math.round((completedChores.length / allChores.length) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Answer 3: Is feed running low? */}
          <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">3. Feed & Supplies</span>
                <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                  {feedInventory.length === 0 ? '0' : feedDaysLeft}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {feedInventory.length === 0 ? 'items tracked' : 'days supply left'}
                </span>
              </div>
              <div className="text-xs mt-1">
                {feedInventory.length === 0 ? (
                  <span className="text-stone-500 dark:text-stone-400">
                    No feed bags logged yet
                  </span>
                ) : lowStockFeedItems.length > 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    ⚠ {lowStockFeedItems.length} below threshold ({lowStockFeedItems[0].name})
                  </span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ Feed & supplements stocked
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('feed')}
              className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Feed Inventory →</span>
            </button>
          </div>

          {/* Answer 4: Is any chicken due for a health check? */}
          <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">4. Health Checks</span>
                <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                  {activeHealthMonitoring.length}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">birds under care</span>
              </div>
              <p className="text-xs mt-1 truncate">
                {activeHealthMonitoring.length > 0 ? (
                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                    ⚠ {activeHealthMonitoring[0].title}
                  </span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ All birds healthy & active
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('health')}
              className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Health Dossiers & Logs →</span>
            </button>
          </div>
        </div>

        {/* Smart Homestead Routine Checklist */}
        <div className="pt-2 border-t border-amber-200/60 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Homestead Routine & Smart Tasks</span>
              </h3>
              <span className="text-[11px] text-stone-400">
                ({completedChores.length}/{allChores.length} done today)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter pills */}
              <div className="inline-flex rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-0.5 text-[11px]">
                <button
                  onClick={() => setChoreFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    choreFilter === 'all'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  All ({allChores.length})
                </button>
                <button
                  onClick={() => setChoreFilter('pending')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    choreFilter === 'pending'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  Pending ({pendingChores.length})
                </button>
                <button
                  onClick={() => setChoreFilter('completed')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    choreFilter === 'completed'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  Completed ({completedChores.length})
                </button>
              </div>

              {/* Add custom chore button */}
              <button
                type="button"
                onClick={() => setIsAddChoreOpen(!isAddChoreOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 rounded-lg transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Add Task</span>
              </button>

              {/* Reset chores button */}
              {completedChores.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetTodayChores}
                  title="Reset today's checks"
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Add custom chore inline creator */}
          {isAddChoreOpen && (
            <form onSubmit={handleAddCustomChore} className="p-3 mb-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={newChoreTitle}
                  onChange={(e) => setNewChoreTitle(e.target.value)}
                  placeholder="Task title (e.g. Scrape dropping boards, Dust bath diatomaceous earth)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <select
                  value={newChoreTime}
                  onChange={(e) => setNewChoreTime(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                >
                  <option value="Morning">Morning</option>
                  <option value="Midday">Midday</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="All Day">All Day</option>
                </select>
                <select
                  value={newChorePriority}
                  onChange={(e) => setNewChorePriority(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Save Task
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddChoreOpen(false)}
                  className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Chores Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredChores.map(chore => {
              const isDone = chore.completed;

              return (
                <div
                  key={chore.id}
                  onClick={() => handleToggleChore(chore.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isDone 
                      ? 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-400'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-500 hover:shadow-xs'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors mt-0.5 ${
                    isDone 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'border-stone-300 dark:border-stone-600 hover:border-amber-600'
                  }`}>
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold ${isDone ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>
                        {chore.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-mono">
                        {chore.timeOfDay}
                      </span>
                      {chore.priority === 'urgent' && !isDone && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 line-clamp-2 ${isDone ? 'text-stone-400 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                      {chore.description}
                    </p>
                  </div>

                  {/* Optional Action Button */}
                  {chore.actionLabel && chore.onAction && !isDone && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        chore.onAction!();
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:text-amber-100 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 rounded-md transition-colors shrink-0 cursor-pointer"
                    >
                      {chore.actionLabel}
                    </button>
                  )}

                  {/* Delete custom chore */}
                  {chore.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomChore(chore.id, e)}
                      title="Delete task"
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            {filteredChores.length === 0 && (
              <div className="col-span-full p-6 text-center text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                {choreFilter === 'pending'
                  ? 'All homestead tasks are complete for today! Enjoy your morning.'
                  : 'No completed tasks yet. Check items above to record your morning homestead progress.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SEASONAL LAYING PREDICTIONS & WEATHER CARE */}
      {/* "Seasonal laying predictions: Estimate upcoming egg production from historical laying data, flock age, molting records, and daylight or weather information. Clearly label estimates rather than promising exact counts." */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seasonal Predictions Card */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>Seasonal Egg Laying Prediction Model</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-normal">
                    Biology-Based Estimate
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Calculated from daylight length ({seasonalPrediction.daylightHours} hrs), hen ages, and feather molting cycles.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                {seasonalPrediction.seasonName} Forecast
              </span>
            </div>
          </div>

          {/* Range cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block uppercase">
                Expected Daily Yield
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                  {seasonalPrediction.estimatedDailyMin} - {seasonalPrediction.estimatedDailyMax}
                </span>
                <span className="text-xs text-stone-500">eggs / day</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Based on {seasonalPrediction.activeHensCount} active layers</p>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block uppercase">
                Expected Weekly Range
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                  {seasonalPrediction.estimatedWeeklyMin} - {seasonalPrediction.estimatedWeeklyMax}
                </span>
                <span className="text-xs text-stone-500">eggs / week</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">~{Math.round((seasonalPrediction.estimatedWeeklyMin / 12) * 10) / 10} - {Math.round((seasonalPrediction.estimatedWeeklyMax / 12) * 10) / 10} cartons</p>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block uppercase">
                Monthly Projection
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                  {seasonalPrediction.estimatedMonthlyMin} - {seasonalPrediction.estimatedMonthlyMax}
                </span>
                <span className="text-xs text-stone-500">eggs</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">30-day estimated output</p>
            </div>
          </div>

          {/* Biological factors breakdown */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block">
              Prediction Biological Modifiers:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {seasonalPrediction.factors.map((f, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                  <span className="font-bold text-stone-800 dark:text-stone-200 block">{f.label}</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block">{f.effect}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explicit label and disclaimer */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong className="font-semibold block mb-0.5">Estimated Projection Notice:</strong>
            {seasonalPrediction.forecastNote}
          </div>
        </div>

        {/* Weather-Aware Flock Care Card */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Weather-Aware Care</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {weatherAdvisory.badge}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                {weatherAdvisory.title}
              </h4>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                {weatherAdvisory.actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => onNavigateToTab('health')}
              className="w-full py-2 text-center text-xs font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-900 bg-amber-50 dark:bg-amber-950/60 rounded-lg transition-colors"
            >
              Open Health & Predator Security Logs →
            </button>
          </div>
        </div>
      </div>

      {/* 4. PRIMARY KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Eggs</span>
            <Egg className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
              {todayEggCount || summary.todayEggCount}
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

      {/* 5. DAILY EGG COUNTS BAR GRAPH */}
      <DailyEggCountsBarGraph
        eggLogs={eggLogs}
        coops={coops}
        chickens={chickens}
        timezone={timezone}
        onOpenLogEggs={onOpenLogEggs}
        onEditLog={onEditEggLog}
        onNavigateToEggsTab={() => onNavigateToTab('eggs')}
      />

      {/* 6. COOP FACILITIES, RECENT COLLECTIONS & ACTIVE GROWTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Coops Overview */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Coop Facility Status</h2>
              <button
                onClick={() => onNavigateToTab('coops')}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">Capacity, roost allocations & nesting boxes.</p>

            {coops.length === 0 ? (
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center text-xs text-stone-500 dark:text-stone-400">
                No coops added yet. Tap "Manage" to set up your first coop facility.
              </div>
            ) : (
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
                      className="w-full text-left p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-700/60 dark:hover:border-amber-500/60 hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-all space-y-2 group cursor-pointer"
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
            )}
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => onNavigateToTab('flock')}
              className="w-full py-2 text-center text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              Browse All {chickens.length} Flock Members →
            </button>
          </div>
        </div>

        {/* Recent Collections */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Recent Collections</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Log entries with shell inspections.</p>
              </div>
              <button
                onClick={() => onNavigateToTab('eggs')}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                All Eggs →
              </button>
            </div>

            {recentLogs.length === 0 ? (
              <div className="mt-4 p-6 text-center text-xs text-stone-500 dark:text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                No egg collections recorded yet. Tap "Log Today's Eggs" above to add your first log.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800 mt-2">
                {recentLogs.map((log) => {
                  const coop = coopMap.get(log.coopId);
                  return (
                    <div key={log.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-amber-800 dark:text-amber-400 shrink-0">
                          <Egg className="w-4 h-4 fill-amber-50 dark:fill-amber-950/40" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate max-w-[90px]">{coop?.name || 'Coop'}</span>
                            <span className="text-[10px] text-stone-400">·</span>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">{log.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {log.eggs.slice(0, 4).map((egg) => (
                              <EggVisual key={egg.id} color={egg.color} shape={egg.shape} size={egg.size} className="w-3.5 h-4.5" />
                            ))}
                            {log.eggs.length > 4 && (
                              <span className="text-[9px] text-stone-400 font-mono">+{log.eggs.length - 4}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                            {log.totalEggs}
                          </span>
                          <span className="text-xs text-stone-500 dark:text-stone-400 ml-1">eggs</span>
                          {log.brokenCount > 0 && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">({log.brokenCount} cracked)</p>
                          )}
                        </div>
                        {onEditEggLog && (
                          <button
                            type="button"
                            onClick={() => onEditEggLog(log)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                            title="Edit collection entry"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => onNavigateToTab('eggs')}
              className="w-full py-2 text-center text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              Open Full Egg Production Ledger →
            </button>
          </div>
        </div>

        {/* Active Growth Monitoring */}
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Growth Tracking</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Pullets and growing birds observation.</p>
              </div>
              <button
                onClick={() => onNavigateToTab('flock')}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Growth Logs →
              </button>
            </div>

            {chickens.filter(c => c.weightRecords && c.weightRecords.length > 0).length === 0 ? (
              <div className="mt-4 p-6 text-center text-xs text-stone-500 dark:text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                No weight records logged yet. Record bird weigh-ins in the Flock tab.
              </div>
            ) : (
              <div className="space-y-2.5 mt-2">
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
                      <div key={chicken.id} className="p-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-750 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <ChickenAvatar chicken={chicken} className="w-8 h-8 rounded-lg shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{chicken.name}</span>
                              <span className="text-[11px] text-stone-500 dark:text-stone-400">({breed?.name})</span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              {chicken.lifeStage.replace('_', ' ')} · {latestWeight.ageWeeks} wks old
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                            {latestWeight.weightGrams}g
                          </span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 ml-1">
                            ({Math.round((latestWeight.weightGrams / 453.6) * 10) / 10} lbs)
                          </span>
                          {gain > 0 && (
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                              +{gain}g gained
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              onClick={() => onNavigateToTab('flock')}
              className="w-full py-2 text-center text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              Open Flock Growth Profiles →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
