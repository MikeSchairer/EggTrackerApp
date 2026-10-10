import { Coop, Chicken, EggLog, EggSize, EggColor, EggShape, BreedInfo } from '../types/flock';
import { CHICKEN_BREEDS } from '../data/breeds';

export interface FlockSummaryMetrics {
  totalEggsAllTime: number;
  totalEggsLast30Days: number;
  totalEggsLast7Days: number;
  todayEggCount: number;
  activeLayersCount: number;
  totalFlockCount: number;
  currentLayingRatePercent: number; // today's eggs / active layers
  average7DayLayingRatePercent: number;
  flawlessRatePercent: number; // eggs without cracks / issues
  averageEggWeightGrams: number;
}

export interface DayYield {
  date: string; // YYYY-MM-DD
  displayDate: string; // "Oct 9"
  totalEggs: number;
  broken: number;
  layingRatePercent: number;
  byCoop: Record<string, number>;
}

export function computeFlockSummary(
  eggLogs: EggLog[],
  chickens: Chicken[],
  targetDate: string = '2026-10-09'
): FlockSummaryMetrics {
  const activeLayers = chickens.filter(c => c.lifeStage === 'active_layer');
  const activeLayersCount = Math.max(1, activeLayers.length);
  const totalFlockCount = chickens.length;

  let totalEggsAllTime = 0;
  let totalBrokenAllTime = 0;
  let totalWeightGrams = 0;
  let eggsWithWeight = 0;

  eggLogs.forEach(log => {
    totalEggsAllTime += log.totalEggs;
    totalBrokenAllTime += log.brokenCount;
    log.eggs.forEach(egg => {
      if (egg.weightGrams) {
        totalWeightGrams += egg.weightGrams;
        eggsWithWeight++;
      }
    });
  });

  // Today eggs
  const todayLogs = eggLogs.filter(log => log.date === targetDate);
  const todayEggCount = todayLogs.reduce((sum, l) => sum + l.totalEggs, 0);

  // Past 7 days & 30 days
  const targetTime = new Date(targetDate).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  let eggsLast7Days = 0;
  let daysInLast7Count = 0;
  let eggsLast30Days = 0;

  for (let i = 0; i < 7; i++) {
    const dStr = new Date(targetTime - i * dayMs).toISOString().split('T')[0];
    const dLogs = eggLogs.filter(l => l.date === dStr);
    const dayTotal = dLogs.reduce((sum, l) => sum + l.totalEggs, 0);
    eggsLast7Days += dayTotal;
    daysInLast7Count++;
  }

  for (let i = 0; i < 30; i++) {
    const dStr = new Date(targetTime - i * dayMs).toISOString().split('T')[0];
    const dLogs = eggLogs.filter(l => l.date === dStr);
    eggsLast30Days += dLogs.reduce((sum, l) => sum + l.totalEggs, 0);
  }

  const currentLayingRatePercent = Math.min(100, Math.round((todayEggCount / activeLayersCount) * 100));
  const avg7DayYield = daysInLast7Count > 0 ? (eggsLast7Days / daysInLast7Count) : 0;
  const average7DayLayingRatePercent = Math.min(100, Math.round((avg7DayYield / activeLayersCount) * 100));
  
  const flawlessRatePercent = totalEggsAllTime > 0 
    ? Math.round(((totalEggsAllTime - totalBrokenAllTime) / totalEggsAllTime) * 100) 
    : 100;

  const averageEggWeightGrams = eggsWithWeight > 0 
    ? Math.round((totalWeightGrams / eggsWithWeight) * 10) / 10 
    : 54.5;

  return {
    totalEggsAllTime,
    totalEggsLast30Days: eggsLast30Days,
    totalEggsLast7Days: eggsLast7Days,
    todayEggCount,
    activeLayersCount,
    totalFlockCount,
    currentLayingRatePercent,
    average7DayLayingRatePercent,
    flawlessRatePercent,
    averageEggWeightGrams,
  };
}

export function computeDailyProductionTrends(
  eggLogs: EggLog[],
  activeLayersCount: number,
  daysCount: number = 14,
  endDateStr: string = '2026-10-09'
): DayYield[] {
  const result: DayYield[] = [];
  const endTime = new Date(endDateStr).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(endTime - i * dayMs);
    const dStr = d.toISOString().split('T')[0];
    const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const logs = eggLogs.filter(l => l.date === dStr);
    const total = logs.reduce((sum, l) => sum + l.totalEggs, 0);
    const broken = logs.reduce((sum, l) => sum + l.brokenCount, 0);

    const byCoop: Record<string, number> = {};
    logs.forEach(l => {
      byCoop[l.coopId] = (byCoop[l.coopId] || 0) + l.totalEggs;
    });

    const activeCount = Math.max(1, activeLayersCount);
    const rate = Math.min(100, Math.round((total / activeCount) * 100));

    result.push({
      date: dStr,
      displayDate: shortLabel,
      totalEggs: total,
      broken,
      layingRatePercent: rate,
      byCoop,
    });
  }

  return result;
}

export function computeEggSizeDistribution(eggLogs: EggLog[]): { size: EggSize; count: number; percentage: number }[] {
  const sizes: EggSize[] = ['peewee', 'small', 'medium', 'large', 'extra_large', 'jumbo'];
  const counts: Record<EggSize, number> = {
    peewee: 0,
    small: 0,
    medium: 0,
    large: 0,
    extra_large: 0,
    jumbo: 0,
  };

  let totalLogged = 0;
  eggLogs.forEach(log => {
    log.eggs.forEach(egg => {
      if (counts[egg.size] !== undefined) {
        counts[egg.size]++;
        totalLogged++;
      }
    });
  });

  return sizes.map(size => ({
    size,
    count: counts[size],
    percentage: totalLogged > 0 ? Math.round((counts[size] / totalLogged) * 100) : 0,
  }));
}

export function computeEggColorDistribution(eggLogs: EggLog[]): { color: EggColor; count: number; percentage: number }[] {
  const colors: EggColor[] = [
    'dark_chocolate',
    'sky_blue',
    'olive_green',
    'terracotta_brown',
    'speckled_brown',
    'pinkish_tint',
    'cream_tinted',
    'chalk_white',
  ];
  const counts: Record<EggColor, number> = {
    dark_chocolate: 0,
    sky_blue: 0,
    olive_green: 0,
    terracotta_brown: 0,
    speckled_brown: 0,
    pinkish_tint: 0,
    cream_tinted: 0,
    chalk_white: 0,
  };

  let totalLogged = 0;
  eggLogs.forEach(log => {
    log.eggs.forEach(egg => {
      if (counts[egg.color] !== undefined) {
        counts[egg.color]++;
        totalLogged++;
      }
    });
  });

  return colors.map(color => ({
    color,
    count: counts[color],
    percentage: totalLogged > 0 ? Math.round((counts[color] / totalLogged) * 100) : 0,
  })).sort((a, b) => b.count - a.count);
}

export function computeEggShapeDistribution(eggLogs: EggLog[]): { shape: EggShape; count: number; percentage: number }[] {
  const shapes: EggShape[] = ['classic_oval', 'pointed', 'elongated', 'round', 'torpedo', 'ridged_textured'];
  const counts: Record<EggShape, number> = {
    classic_oval: 0,
    pointed: 0,
    elongated: 0,
    round: 0,
    torpedo: 0,
    ridged_textured: 0,
  };

  let totalLogged = 0;
  eggLogs.forEach(log => {
    log.eggs.forEach(egg => {
      if (counts[egg.shape] !== undefined) {
        counts[egg.shape]++;
        totalLogged++;
      }
    });
  });

  return shapes.map(shape => ({
    shape,
    count: counts[shape],
    percentage: totalLogged > 0 ? Math.round((counts[shape] / totalLogged) * 100) : 0,
  }));
}

export interface CoopPerformance {
  coop: Coop;
  totalEggs: number;
  eggSharePercent: number;
  chickenCount: number;
  activeLayerCount: number;
  occupancyPercent: number;
  averageDailyEggs: number;
  layingEfficiencyPercent: number;
}

export function computeCoopPerformance(coops: Coop[], chickens: Chicken[], eggLogs: EggLog[]): CoopPerformance[] {
  const totalAllEggs = eggLogs.reduce((sum, l) => sum + l.totalEggs, 0);

  return coops.map(coop => {
    const coopChickens = chickens.filter(c => c.coopId === coop.id);
    const activeLayers = coopChickens.filter(c => c.lifeStage === 'active_layer');
    const chickenCount = coopChickens.length;
    const activeLayerCount = activeLayers.length;

    const coopLogs = eggLogs.filter(l => l.coopId === coop.id);
    const totalEggs = coopLogs.reduce((sum, l) => sum + l.totalEggs, 0);
    const eggSharePercent = totalAllEggs > 0 ? Math.round((totalEggs / totalAllEggs) * 100) : 0;

    // Unique dates
    const uniqueDates = new Set(coopLogs.map(l => l.date)).size;
    const avgDaily = uniqueDates > 0 ? Math.round((totalEggs / uniqueDates) * 10) / 10 : 0;

    const efficiency = activeLayerCount > 0 ? Math.min(100, Math.round((avgDaily / activeLayerCount) * 100)) : 0;
    const occupancyPercent = coop.capacity > 0 ? Math.round((chickenCount / coop.capacity) * 100) : 0;

    return {
      coop,
      totalEggs,
      eggSharePercent,
      chickenCount,
      activeLayerCount,
      occupancyPercent,
      averageDailyEggs: avgDaily,
      layingEfficiencyPercent: efficiency,
    };
  });
}

export interface BreedYieldStats {
  breed: BreedInfo;
  birdCount: number;
  identifiedEggsCount: number;
  averageEggWeight: number;
}

export function computeBreedPerformance(eggLogs: EggLog[], chickens: Chicken[]): BreedYieldStats[] {
  const chickenMap = new Map(chickens.map(c => [c.id, c]));
  const breedStatsMap = new Map<string, { birdCount: number; eggCount: number; totalWeight: number; weightEggCount: number }>();

  CHICKEN_BREEDS.forEach(b => {
    breedStatsMap.set(b.id, { birdCount: 0, eggCount: 0, totalWeight: 0, weightEggCount: 0 });
  });

  chickens.forEach(c => {
    const entry = breedStatsMap.get(c.breedId);
    if (entry) {
      entry.birdCount++;
    }
  });

  eggLogs.forEach(log => {
    log.eggs.forEach(egg => {
      if (egg.chickenId) {
        const hen = chickenMap.get(egg.chickenId);
        if (hen) {
          const entry = breedStatsMap.get(hen.breedId);
          if (entry) {
            entry.eggCount++;
            if (egg.weightGrams) {
              entry.totalWeight += egg.weightGrams;
              entry.weightEggCount++;
            }
          }
        }
      }
    });
  });

  return CHICKEN_BREEDS
    .filter(b => {
      const stats = breedStatsMap.get(b.id);
      return stats && (stats.birdCount > 0 || stats.eggCount > 0);
    })
    .map(breed => {
      const stats = breedStatsMap.get(breed.id)!;
      return {
        breed,
        birdCount: stats.birdCount,
        identifiedEggsCount: stats.eggCount,
        averageEggWeight: stats.weightEggCount > 0 ? Math.round(stats.totalWeight / stats.weightEggCount) : 55,
      };
    })
    .sort((a, b) => b.identifiedEggsCount - a.identifiedEggsCount);
}

// Bird Age in Weeks
export function calculateAgeInWeeks(hatchDateStr: string, asOfDateStr: string = '2026-10-09'): number {
  const hatch = new Date(hatchDateStr).getTime();
  const current = new Date(asOfDateStr).getTime();
  const diffDays = Math.max(0, Math.floor((current - hatch) / (1000 * 60 * 60 * 24)));
  return Math.floor(diffDays / 7);
}

export function formatAgeFriendly(weeks: number): string {
  if (weeks < 4) {
    return `${weeks} weeks`;
  }
  if (weeks < 26) {
    const months = Math.floor(weeks / 4.3);
    return `${weeks} wks (${months} mos)`;
  }
  const years = Math.floor(weeks / 52);
  const remMonths = Math.floor((weeks % 52) / 4.3);
  if (years === 0) {
    return `${Math.floor(weeks / 4.3)} months`;
  }
  return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} year${years > 1 ? 's' : ''}`;
}

export function getLatestWeight(chicken: Chicken): number | null {
  if (!chicken.weightRecords || chicken.weightRecords.length === 0) return null;
  const sorted = [...chicken.weightRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sorted[0].weightGrams;
}
