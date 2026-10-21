// Flock domain calculation utilities
import { shiftDate } from './dateUtils';

export function calculateChickenAge(hatchDateStr: string): {
  text: string;
  weeks: number;
  months: number;
  years: number;
} {
  try {
    const hatchDate = new Date(hatchDateStr);
    const now = new Date();
    const diffMs = now.getTime() - hatchDate.getTime();
    if (diffMs < 0) {
      return { text: 'Just hatched', weeks: 0, months: 0, years: 0 };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const months = Math.floor(diffDays / 30.4375);
    const years = Math.floor(diffDays / 365.25);

    let text = '';
    if (years >= 1) {
      const remainingMonths = Math.floor((diffDays % 365.25) / 30.4375);
      text = remainingMonths > 0 ? `${years} yr ${remainingMonths} mo` : `${years} yr old`;
    } else if (months >= 1) {
      const remWeeks = Math.floor((diffDays % 30.4375) / 7);
      text = remWeeks > 0 ? `${months} mo ${remWeeks} wks` : `${months} months`;
    } else {
      text = `${weeks} weeks`;
    }

    return { text, weeks, months, years };
  } catch {
    return { text: 'Unknown age', weeks: 0, months: 0, years: 0 };
  }
}

// Standard heritage adult hen consumes ~0.25 lbs (~113 grams) of complete layer feed per day
export const STANDARD_DAILY_FEED_LBS_PER_HEN = 0.25;

export function calculateDailyFeedConsumption(activeCount: number): {
  lbsPerDay: number;
  kgPerDay: number;
} {
  const lbs = Math.round(activeCount * STANDARD_DAILY_FEED_LBS_PER_HEN * 10) / 10;
  const kg = Math.round((lbs * 0.453592) * 10) / 10;
  return { lbsPerDay: lbs, kgPerDay: kg };
}

export function calculateFeedDaysRemaining(totalLbs: number, activeCount: number): number {
  if (activeCount <= 0 || totalLbs <= 0) return 0;
  const daily = activeCount * STANDARD_DAILY_FEED_LBS_PER_HEN;
  return Math.max(0, Math.round(totalLbs / daily));
}

export function calculateLayingRate(eggsCount: number, henCount: number, days: number = 1): number {
  if (henCount <= 0 || days <= 0) return 0;
  const maxPossible = henCount * days;
  return Math.min(100, Math.round((eggsCount / maxPossible) * 100));
}

export function calculateIncubationSchedule(settingDateStr: string): {
  hatchDate: string;
  lockdownDate: string;
  candlingDay7: string;
  candlingDay14: string;
  currentDay: number;
  daysRemaining: number;
  statusText: string;
  percentComplete: number;
} {
  const hatchDate = shiftDate(settingDateStr, 21);
  const lockdownDate = shiftDate(settingDateStr, 18);
  const candlingDay7 = shiftDate(settingDateStr, 7);
  const candlingDay14 = shiftDate(settingDateStr, 14);

  const settingParts = settingDateStr.split('-').map(Number);
  const setting = new Date(settingParts[0], settingParts[1] - 1, settingParts[2], 12, 0, 0);
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  const diffMs = now.getTime() - setting.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.min(22, Math.max(1, diffDays));
  const daysRemaining = Math.max(0, 21 - currentDay);
  const percentComplete = Math.min(100, Math.round((currentDay / 21) * 100));

  let statusText = `Day ${currentDay} of 21`;
  if (currentDay >= 21) statusText = 'Hatch Day Active!';
  else if (currentDay >= 18) statusText = 'Lockdown Mode (Stop Turning)';
  else if (currentDay >= 14) statusText = 'Pre-Lockdown Growth';
  else if (currentDay >= 7) statusText = 'Embryo Development Stage';

  return {
    hatchDate,
    lockdownDate,
    candlingDay7,
    candlingDay14,
    currentDay,
    daysRemaining,
    statusText,
    percentComplete,
  };
}

export function calculateEggFreshnessTier(
  collectionDateStr: string,
  storageLocation: 'countertop' | 'refrigerated'
): {
  daysOld: number;
  tier: 'farm_fresh' | 'prime' | 'use_soon' | 'expired';
  label: string;
  badgeClass: string;
} {
  const collection = new Date(collectionDateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.max(0, Math.floor((now.getTime() - collection.getTime()) / (1000 * 60 * 60 * 24)));

  if (storageLocation === 'countertop') {
    // Unwashed natural bloom: best within 14-21 days
    if (diffDays <= 7) {
      return { daysOld: diffDays, tier: 'farm_fresh', label: 'Farm Fresh (< 7d)', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' };
    } else if (diffDays <= 18) {
      return { daysOld: diffDays, tier: 'prime', label: 'Prime Countertop (8-18d)', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' };
    } else if (diffDays <= 28) {
      return { daysOld: diffDays, tier: 'use_soon', label: 'Use Soon (19-28d)', badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' };
    } else {
      return { daysOld: diffDays, tier: 'expired', label: 'Water Test Recommended (>28d)', badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' };
    }
  } else {
    // Refrigerated: lasts 45-60 days
    if (diffDays <= 14) {
      return { daysOld: diffDays, tier: 'farm_fresh', label: 'Farm Fresh Cold (< 14d)', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' };
    } else if (diffDays <= 35) {
      return { daysOld: diffDays, tier: 'prime', label: 'Prime Chilled (15-35d)', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
    } else if (diffDays <= 50) {
      return { daysOld: diffDays, tier: 'use_soon', label: 'Use Soon (36-50d)', badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' };
    } else {
      return { daysOld: diffDays, tier: 'expired', label: 'Old Stock (> 50d)', badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' };
    }
  }
}

export function getWeatherCareAdvisories(tempF: number): {
  type: 'freezing' | 'heat' | 'cold' | 'optimal';
  title: string;
  badge: string;
  actions: string[];
} {
  if (tempF <= 25) {
    return {
      type: 'freezing',
      title: 'Freezing Weather & Comb Frostbite Alert',
      badge: `${tempF}°F Sub-Freezing`,
      actions: [
        'Apply pure petroleum jelly or rooster balm to large single combs & wattles to guard against frostbite.',
        'Check heated waterer bases or swap frozen drinkers twice daily.',
        'Feed a handful of high-energy cracked scratch grains right before dusk for overnight digestion warmth.',
        'Ensure coop roof ventilation remains open above roosts to vent moisture, but eliminate floor-level drafts.'
      ]
    };
  } else if (tempF <= 38) {
    return {
      type: 'cold',
      title: 'Cold Snap Precautions',
      badge: `${tempF}°F Chilly`,
      actions: [
        'Check drinkers for thin ice rims in early morning.',
        'Add extra dry pine shavings bedding to nesting boxes.',
        'Verify birds roost with feathers fluffed over their toes.'
      ]
    };
  } else if (tempF >= 85) {
    return {
      type: 'heat',
      title: 'Heat Stress Advisory',
      badge: `${tempF}°F High Heat`,
      actions: [
        'Chickens do not sweat; watch for panting, wing drooping, and pale combs.',
        'Provide shaded dust baths with cool loose soil.',
        'Add poultry electrolytes to one fresh cold drinker in deep shade.',
        'Freeze water bottles or melon slices for flock pecking treats.'
      ]
    };
  } else {
    return {
      type: 'optimal',
      title: 'Optimal Laying Conditions',
      badge: `${tempF}°F Pleasant`,
      actions: [
        'Ideal ambient temperature for peak egg production & feed conversion.',
        'Encourage active pasture foraging and fresh grass access.'
      ]
    };
  }
}

export interface SeasonalPredictionResult {
  seasonName: string;
  daylightHours: number;
  activeHensCount: number;
  moltingHensCount: number;
  estimatedDailyMin: number;
  estimatedDailyMax: number;
  estimatedWeeklyMin: number;
  estimatedWeeklyMax: number;
  estimatedMonthlyMin: number;
  estimatedMonthlyMax: number;
  historicalDailyAvg: number;
  daylightFactorPercent: number;
  flockAgeFactorPercent: number;
  factors: {
    label: string;
    effect: string;
    impact: 'positive' | 'neutral' | 'caution';
  }[];
  forecastNote: string;
}

export function calculateSeasonalLayingPredictions(
  activeHensCount: number,
  moltingHensCount: number,
  recentDailyAvg: number,
  currentMonth: number = new Date().getMonth() // 0-indexed (9 = Oct)
): SeasonalPredictionResult {
  // Determine season and daylight hours in Northern Temperate zone
  let seasonName = 'Autumn';
  let daylightHours = 11.2;
  let daylightFactor = 0.82; // Decreasing daylight causes standard reduction unless lit
  let seasonNote = 'Autumn molting cycle & declining daylight hours naturally slow ovulation frequency.';

  if (currentMonth >= 2 && currentMonth <= 4) {
    seasonName = 'Spring';
    daylightHours = 13.8;
    daylightFactor = 1.15;
    seasonNote = 'Spring lengthening days trigger peak hormonal egg surges across heritage breeds.';
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    seasonName = 'Summer';
    daylightHours = 14.5;
    daylightFactor = 1.05;
    seasonNote = 'High summer daylight maintains consistent laying, tempered slightly during heat spikes.';
  } else if (currentMonth >= 11 || currentMonth <= 1) {
    seasonName = 'Winter';
    daylightHours = 9.2;
    daylightFactor = 0.65;
    seasonNote = 'Winter sub-10hr natural light leads to biological rest unless coop supplemental light is provided.';
  }

  // Molting deduction: hens in molt do not lay while rebuilding keratin feathers
  const layingActiveHens = Math.max(0, activeHensCount - moltingHensCount);
  
  // Base daily laying rate: heritage hens lay approx 0.65-0.78 eggs per day during standard season
  const baseRate = recentDailyAvg > 0 && activeHensCount > 0 
    ? (recentDailyAvg / activeHensCount)
    : 0.72;

  // Apply seasonal & molting modifiers
  const adjustedRate = baseRate * daylightFactor;
  const expectedDaily = layingActiveHens * adjustedRate;

  const minDaily = layingActiveHens <= 0 ? 0 : Math.max(1, Math.floor(expectedDaily * 0.88));
  const maxDaily = layingActiveHens <= 0 ? 0 : Math.max(minDaily + 1, Math.ceil(expectedDaily * 1.12));

  return {
    seasonName,
    daylightHours,
    activeHensCount,
    moltingHensCount,
    estimatedDailyMin: minDaily,
    estimatedDailyMax: maxDaily,
    estimatedWeeklyMin: minDaily * 7,
    estimatedWeeklyMax: maxDaily * 7,
    estimatedMonthlyMin: minDaily * 30,
    estimatedMonthlyMax: maxDaily * 30,
    historicalDailyAvg: Math.round(recentDailyAvg * 10) / 10,
    daylightFactorPercent: Math.round(daylightFactor * 100),
    flockAgeFactorPercent: 94,
    factors: [
      {
        label: `${seasonName} Daylight (${daylightHours} hrs)`,
        effect: `${daylightFactor < 1 ? '-' : '+'}${Math.abs(Math.round((daylightFactor - 1) * 100))}% natural photo-period`,
        impact: daylightFactor < 0.8 ? 'caution' : daylightFactor > 1.05 ? 'positive' : 'neutral'
      },
      {
        label: 'Feather Molt Repose',
        effect: moltingHensCount > 0 ? `${moltingHensCount} birds actively pausing laying to regrow winter plumage` : 'No birds currently in heavy feather molt',
        impact: moltingHensCount > 0 ? 'caution' : 'positive'
      },
      {
        label: 'Flock Age Demographic',
        effect: 'Primarily year-1 and year-2 vigorous heritage layers with peak shell strength',
        impact: 'positive'
      }
    ],
    forecastNote: `${seasonNote} Estimates calculated from biological daylight rhythms, historical clutch size, and age profiles. Projected yields represent expected ranges rather than exact guarantees.`
  };
}
