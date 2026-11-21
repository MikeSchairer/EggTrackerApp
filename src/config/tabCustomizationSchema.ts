import { AppTabId, TabLayoutConfig } from '../types/flock';

export interface SectionItemSchema {
  id: string;
  label: string;
  description?: string;
  defaultVisible: boolean;
}

export interface SectionSchema {
  id: string;
  title: string;
  description: string;
  defaultVisible: boolean;
  items: SectionItemSchema[];
}

export interface TabSchema {
  id: AppTabId;
  label: string;
  sections: SectionSchema[];
}

export const TAB_CUSTOMIZATION_SCHEMAS: Record<AppTabId, TabSchema> = {
  dashboard: {
    id: 'dashboard',
    label: 'Overview',
    sections: [
      {
        id: 'hero',
        title: 'Hero Flock Banner',
        description: 'Top pasture banner with today summary and primary actions.',
        defaultVisible: true,
        items: [
          { id: 'dateBadge', label: 'Monitor Label & Date', defaultVisible: true },
          { id: 'summaryText', label: 'Flock & Daily Yield Summary', defaultVisible: true },
          { id: 'actionButtons', label: 'Quick Action Buttons', defaultVisible: true },
          { id: 'timezoneButton', label: 'Time Zone Button', defaultVisible: true },
        ],
      },
      {
        id: 'briefing',
        title: 'Smart Daily Flock Briefing',
        description: 'Morning status cards, single-tap shortcuts, and daily chores checklist.',
        defaultVisible: true,
        items: [
          { id: 'quickActions', label: 'Quick Action Shortcuts', defaultVisible: true },
          { id: 'cardEggsToday', label: 'Card: Eggs Collected Today', defaultVisible: true },
          { id: 'cardChoresDue', label: 'Card: Chores Due Today', defaultVisible: true },
          { id: 'cardFeedStock', label: 'Card: Feed & Supplies Status', defaultVisible: true },
          { id: 'cardHealthChecks', label: 'Card: Health Checks', defaultVisible: true },
          { id: 'choreChecklist', label: 'Homestead Routine & Chores List', defaultVisible: true },
        ],
      },
      {
        id: 'seasonal_weather',
        title: 'Seasonal Predictions & Weather Care',
        description: 'Biology-based laying forecast ranges and weather-triggered advisories.',
        defaultVisible: true,
        items: [
          { id: 'seasonalCard', label: 'Seasonal Laying Prediction Card', defaultVisible: true },
          { id: 'seasonalRanges', label: 'Daily / Weekly / Monthly Output Ranges', defaultVisible: true },
          { id: 'seasonalModifiers', label: 'Biological Modifiers Breakdown', defaultVisible: true },
          { id: 'seasonalNotice', label: 'Estimated Projection Notice', defaultVisible: true },
          { id: 'weatherCard', label: 'Weather-Aware Care Card', defaultVisible: true },
          { id: 'weatherActions', label: 'Weather Action Checklist', defaultVisible: true },
        ],
      },
      {
        id: 'kpis',
        title: 'Primary KPI Metrics',
        description: 'Four key snapshot metrics for daily yield, averages, layers, and capacity.',
        defaultVisible: true,
        items: [
          { id: 'todayEggs', label: "Today's Eggs", defaultVisible: true },
          { id: 'movingAvg7Day', label: '7-Day Moving Avg', defaultVisible: true },
          { id: 'activeLayers', label: 'Active Layers', defaultVisible: true },
          { id: 'coopUtilization', label: 'Coop Utilization', defaultVisible: true },
        ],
      },
      {
        id: 'egg_chart',
        title: 'Daily Egg Counts Bar Graph',
        description: 'Interactive bar graph with time windows, coop filter, and day inspector.',
        defaultVisible: true,
        items: [
          { id: 'windowAndFilters', label: 'Time Window & Coop Filter Controls', defaultVisible: true },
          { id: 'summaryCards', label: 'Total / Avg / Peak / Quality Strip', defaultVisible: true },
          { id: 'legend', label: 'Chart Legend & Average Line', defaultVisible: true },
        ],
      },
      {
        id: 'homestead_cards',
        title: 'Coops, Recent Collections & Growth',
        description: 'Facility occupancy cards, latest egg harvests, and pullet growth weights.',
        defaultVisible: true,
        items: [
          { id: 'coopStatusCard', label: 'Coop Facility Status Card', defaultVisible: true },
          { id: 'coopOccupancyBars', label: 'Coop Occupancy Progress Bars', defaultVisible: true },
          { id: 'recentCollectionsCard', label: 'Recent Collections Card', defaultVisible: true },
          { id: 'recentEggVisuals', label: 'Egg Shell Visual Icons', defaultVisible: true },
          { id: 'growthTrackingCard', label: 'Growth Tracking Card', defaultVisible: true },
          { id: 'growthWeightGain', label: 'Weight Gain & Lbs Conversion', defaultVisible: true },
        ],
      },
    ],
  },

  eggs: {
    id: 'eggs',
    label: 'Daily Eggs',
    sections: [
      {
        id: 'kpis',
        title: 'Production KPIs',
        description: '7-day harvest, 30-day total, laying rate, and carton inventory.',
        defaultVisible: true,
        items: [
          { id: 'last7Days', label: '7-Day Harvest', defaultVisible: true },
          { id: 'last30Days', label: '30-Day Monthly Yield', defaultVisible: true },
          { id: 'layingRate', label: 'Flock Laying Rate', defaultVisible: true },
          { id: 'cartonInventory', label: 'Carton Inventory', defaultVisible: true },
        ],
      },
      {
        id: 'outcomes',
        title: 'Egg Outcomes & Defect Tracking',
        description: 'Breakdown of intact, dirty, cracked, soft-shell, incubated, and sold eggs.',
        defaultVisible: true,
        items: [
          { id: 'cleanIntact', label: 'Clean & Intact Count', defaultVisible: true },
          { id: 'dirty', label: 'Dirty / Needs Wash Count', defaultVisible: true },
          { id: 'cracked', label: 'Cracked / Hairline Count', defaultVisible: true },
          { id: 'eatenSoft', label: 'Eaten / Soft Shell Count', defaultVisible: true },
          { id: 'incubated', label: 'Reserved Incubator Count', defaultVisible: true },
          { id: 'sold', label: 'Sold / Gifted Count', defaultVisible: true },
        ],
      },
      {
        id: 'spectrum',
        title: 'Flock Egg Color Spectrum',
        description: 'Interactive shell color palette breakdown and quick filter buttons.',
        defaultVisible: true,
        items: [
          { id: 'eggIcons', label: 'Visual Egg Icons', defaultVisible: true },
          { id: 'loggedCounts', label: 'Per-Color Logged Counts', defaultVisible: true },
        ],
      },
      {
        id: 'filters',
        title: 'Harvest Filters Toolbar',
        description: 'Filter egg logs by coop, size grade, shell color, and shape.',
        defaultVisible: true,
        items: [
          { id: 'coopFilter', label: 'Coop Selector', defaultVisible: true },
          { id: 'sizeFilter', label: 'Size Grade Selector', defaultVisible: true },
          { id: 'colorFilter', label: 'Color Selector', defaultVisible: true },
          { id: 'shapeFilter', label: 'Shape Selector', defaultVisible: true },
          { id: 'summaryFooter', label: 'Matching Entry & Egg Totals', defaultVisible: true },
        ],
      },
      {
        id: 'ledger',
        title: 'Daily Harvest Ledger',
        description: 'Expandable collection log cards with individual egg details.',
        defaultVisible: true,
        items: [
          { id: 'weatherTag', label: 'Weather Tag', defaultVisible: true },
          { id: 'eggIconsRow', label: 'Mini Egg Preview Icons', defaultVisible: true },
          { id: 'crackedBadge', label: 'Cracked Count Label', defaultVisible: true },
          { id: 'notes', label: 'Collection Notes', defaultVisible: true },
          { id: 'perEggGrid', label: 'Per-Egg Inspection Grid', defaultVisible: true },
          { id: 'layerAttribution', label: 'Laying Hen Attribution', defaultVisible: true },
        ],
      },
    ],
  },

  flock: {
    id: 'flock',
    label: 'Flock',
    sections: [
      {
        id: 'filters',
        title: 'Search & Filter Bar',
        description: 'Filter birds by name, band ID, coop, breed, life stage, and status.',
        defaultVisible: true,
        items: [
          { id: 'searchBox', label: 'Name / Leg Band Search', defaultVisible: true },
          { id: 'coopFilter', label: 'Coop Filter', defaultVisible: true },
          { id: 'breedFilter', label: 'Breed Filter', defaultVisible: true },
          { id: 'stageFilter', label: 'Life Stage Filter', defaultVisible: true },
          { id: 'statusFilter', label: 'Flock Status Filter', defaultVisible: true },
          { id: 'countSummary', label: 'Bird Count Summary', defaultVisible: true },
        ],
      },
      {
        id: 'roster_and_dossier',
        title: 'Flock Roster & Bird Dossier',
        description: 'Bird list cards alongside the selected chicken growth & laying profile.',
        defaultVisible: true,
        items: [
          { id: 'birdAvatars', label: 'Chicken Profile Photos / Avatars', defaultVisible: true },
          { id: 'legBandId', label: 'Leg Band ID Badges', defaultVisible: true },
          { id: 'eggColorText', label: 'Expected Egg Shell Color', defaultVisible: true },
          { id: 'coopAndWeightRow', label: 'Coop & Latest Weight Footer', defaultVisible: true },
          { id: 'qrButton', label: 'QR Code Button', defaultVisible: true },
          { id: 'dossierPanel', label: 'Detailed Bird Dossier Panel', defaultVisible: true },
          { id: 'dossierQuickSpecs', label: 'Quick Spec Metrics Grid', defaultVisible: true },
          { id: 'coopTransfer', label: 'Coop Relocation Controller', defaultVisible: true },
          { id: 'growthMilestones', label: 'Growth Milestones Comparison', defaultVisible: true },
          { id: 'weighInHistory', label: 'Weigh-In Log History Table', defaultVisible: true },
          { id: 'managerNotes', label: 'Manager Notes', defaultVisible: true },
        ],
      },
    ],
  },

  coops: {
    id: 'coops',
    label: 'Coops',
    sections: [
      {
        id: 'coop_cards',
        title: 'Coop Facility Cards',
        description: 'Select active coop and inspect capacity and cleaning frequency.',
        defaultVisible: true,
        items: [
          { id: 'locationDesc', label: 'Location Description', defaultVisible: true },
          { id: 'occupancyBar', label: 'Occupancy Progress Bar', defaultVisible: true },
          { id: 'cleaningMeta', label: 'Last Cleaned & Run Space Footer', defaultVisible: true },
        ],
      },
      {
        id: 'coop_workspace',
        title: 'Active Coop Details, Environment & Maintenance',
        description: 'Housing specs, resident birds list, temperature/humidity logs, and chores.',
        defaultVisible: true,
        items: [
          { id: 'cleanButton', label: 'Log Cleaning Done Today Button', defaultVisible: true },
          { id: 'metricsGrid', label: '5-Metric Housing Specs Grid', defaultVisible: true },
          { id: 'residentBirds', label: 'Resident Birds Directory', defaultVisible: true },
          { id: 'envTab', label: 'Temperature & Ventilation Tab', defaultVisible: true },
          { id: 'maintTab', label: 'Feeders & Maintenance Tab', defaultVisible: true },
        ],
      },
    ],
  },

  feed: {
    id: 'feed',
    label: 'Feed & Supplies',
    sections: [
      {
        id: 'low_stock_alert',
        title: 'Low-Stock Warning Banner',
        description: 'Automatic alert when supplies drop below safety thresholds.',
        defaultVisible: true,
        items: [
          { id: 'itemBreakdown', label: 'Low-Stock Item Quantities List', defaultVisible: true },
        ],
      },
      {
        id: 'kpis',
        title: 'Consumption & Cost Summary KPIs',
        description: 'Feed stock remaining, daily consumption, cost per hen, and cost per dozen.',
        defaultVisible: true,
        items: [
          { id: 'totalFeedOnHand', label: 'Total Feed On Hand', defaultVisible: true },
          { id: 'dailyConsumption', label: 'Daily Consumption Rate', defaultVisible: true },
          { id: 'costPerHen', label: 'Feed Cost / Hen', defaultVisible: true },
          { id: 'costPerDozen', label: 'Feed Cost / Dozen Eggs', defaultVisible: true },
        ],
      },
      {
        id: 'category_filters',
        title: 'Supply Category Filter Tabs',
        description: 'Switch between all supplies, main feeds, supplements, and bedding.',
        defaultVisible: true,
        items: [
          { id: 'itemCounts', label: 'Total Supplies Count Label', defaultVisible: true },
        ],
      },
      {
        id: 'supplies_grid',
        title: 'Supplies Inventory Cards',
        description: 'Individual feed, supplement, and bedding bag cards with quick adjusters.',
        defaultVisible: true,
        items: [
          { id: 'brandLabel', label: 'Brand Name', defaultVisible: true },
          { id: 'lowStockBadge', label: 'Low Stock Badge', defaultVisible: true },
          { id: 'progressBar', label: 'Stock Level Progress Bar', defaultVisible: true },
          { id: 'costAndThreshold', label: 'Cost / Bag & Threshold Specs', defaultVisible: true },
          { id: 'purchaseDate', label: 'Purchase Date', defaultVisible: true },
          { id: 'notes', label: 'Supply Notes', defaultVisible: true },
          { id: 'quickAdjustButtons', label: 'Quick - / + / +New Bag Controls', defaultVisible: true },
        ],
      },
    ],
  },

  incubation: {
    id: 'incubation',
    label: 'Incubation',
    sections: [
      {
        id: 'countdown',
        title: '21-Day Countdown & Timeline',
        description: 'Current incubation progress bar, expected hatch date, and milestones.',
        defaultVisible: true,
        items: [
          { id: 'batchMeta', label: 'Set Date, Incubator & Egg Count', defaultVisible: true },
          { id: 'hatchEstimate', label: 'Estimated Hatch Day Counter', defaultVisible: true },
          { id: 'progressBar', label: '21-Day Progress Bar', defaultVisible: true },
          { id: 'milestonesStrip', label: 'Day 1 / 7 / 14 / 18 Milestone Cards', defaultVisible: true },
        ],
      },
      {
        id: 'parameters',
        title: 'Target Parameters & Turning Log',
        description: 'Target temperature, humidity range, and daily egg turning counter.',
        defaultVisible: true,
        items: [
          { id: 'temperatureCard', label: 'Target Temperature Card', defaultVisible: true },
          { id: 'humidityCard', label: 'Target Humidity Card', defaultVisible: true },
          { id: 'turningCard', label: "Today's Turning Log Card", defaultVisible: true },
        ],
      },
      {
        id: 'candling_and_hatch',
        title: 'Candling Logs & Hatch Outcomes',
        description: 'Fertility check history and final hatched chick outcome statistics.',
        defaultVisible: true,
        items: [
          { id: 'candlingCard', label: 'Fertility & Candling Logs Card', defaultVisible: true },
          { id: 'candlingBreakdown', label: 'Fertile / Clear / Quitters Counts', defaultVisible: true },
          { id: 'hatchOutcomesCard', label: 'Hatch Outcomes & Success Card', defaultVisible: true },
        ],
      },
    ],
  },

  health: {
    id: 'health',
    label: 'Health & Security',
    sections: [
      {
        id: 'sub_nav',
        title: 'Health & Security Sub-Tabs',
        description: 'Navigation bar for dossiers, weather care, predator logs, and lockdown.',
        defaultVisible: true,
        items: [
          { id: 'counts', label: 'Record Counts Badges', defaultVisible: true },
        ],
      },
      {
        id: 'active_panel',
        title: 'Health, Weather, Predators & Lockdown View',
        description: 'Customize which details display inside the active health or security view.',
        defaultVisible: true,
        items: [
          { id: 'birdFilter', label: 'Bird Filter Bar (Dossiers)', defaultVisible: true },
          { id: 'symptomsAndTreatment', label: 'Symptoms & Treatment Details', defaultVisible: true },
          { id: 'withdrawalAlert', label: 'Egg Withdrawal Warning Banner', defaultVisible: true },
          { id: 'recordNotes', label: 'Clinical & Incident Notes', defaultVisible: true },
          { id: 'weatherSimulator', label: 'Weather Simulation Buttons', defaultVisible: true },
          { id: 'predatorActions', label: 'Predator Defense Action Box', defaultVisible: true },
          { id: 'lockdownDescriptions', label: 'Lockdown Checklist Descriptions', defaultVisible: true },
        ],
      },
    ],
  },

  finances: {
    id: 'finances',
    label: 'Finances',
    sections: [
      {
        id: 'kpis',
        title: 'Financial Summary KPIs',
        description: 'Operating balance, true cost per dozen, dozens sold, and margin.',
        defaultVisible: true,
        items: [
          { id: 'netBalance', label: 'Net Operating Balance', defaultVisible: true },
          { id: 'costPerDozen', label: 'True Cost / Dozen', defaultVisible: true },
          { id: 'dozensSold', label: 'Dozens Sold', defaultVisible: true },
          { id: 'profitMargin', label: 'Profit Margin / Dozen', defaultVisible: true },
        ],
      },
      {
        id: 'ledger',
        title: 'Transaction History & Expense Journal',
        description: 'Filterable table of egg sales, feed purchases, and operating expenses.',
        defaultVisible: true,
        items: [
          { id: 'typeFilter', label: 'All / Income / Expense Filter', defaultVisible: true },
          { id: 'typeColumn', label: 'Type Column', defaultVisible: true },
          { id: 'categoryColumn', label: 'Category Column', defaultVisible: true },
          { id: 'quantityRateColumn', label: 'Quantity / Rate Column', defaultVisible: true },
          { id: 'notes', label: 'Transaction Notes', defaultVisible: true },
          { id: 'deleteAction', label: 'Delete Action Column', defaultVisible: true },
        ],
      },
    ],
  },

  breeds: {
    id: 'breeds',
    label: 'Breed Library',
    sections: [
      {
        id: 'filters',
        title: 'Breed Search & Filter Bar',
        description: 'Search breeds by name or origin and filter by purpose or egg color.',
        defaultVisible: true,
        items: [
          { id: 'searchBox', label: 'Breed Search Input', defaultVisible: true },
          { id: 'purposeFilter', label: 'Purpose Filter', defaultVisible: true },
          { id: 'eggColorFilter', label: 'Egg Color Filter', defaultVisible: true },
          { id: 'countSummary', label: 'Matching Count Summary', defaultVisible: true },
        ],
      },
      {
        id: 'breed_explorer',
        title: 'Breed List & Standards Encyclopedia',
        description: 'Heritage poultry list and detailed production, hardiness, and weight standards.',
        defaultVisible: true,
        items: [
          { id: 'listEggVisual', label: 'Egg Preview Icons in List', defaultVisible: true },
          { id: 'listFlockCount', label: 'Flock Count Indicator', defaultVisible: true },
          { id: 'listSpecsFooter', label: 'Annual Eggs / Color / Comb Footer', defaultVisible: true },
          { id: 'breedDescription', label: 'Breed Description Summary', defaultVisible: true },
          { id: 'eggSpecs', label: 'Egg Production Characteristics', defaultVisible: true },
          { id: 'morphology', label: 'Morphology & Hardiness Cards', defaultVisible: true },
          { id: 'adultWeights', label: 'Adult Target Weights', defaultVisible: true },
          { id: 'growthTable', label: 'Growth Milestone Weight Table', defaultVisible: true },
        ],
      },
    ],
  },

  analytics: {
    id: 'analytics',
    label: 'Analytics',
    sections: [
      {
        id: 'kpis',
        title: 'High-Level Benchmark KPIs',
        description: '30-day harvest, 7-day lay efficiency, avg egg weight, and shell integrity.',
        defaultVisible: true,
        items: [
          { id: 'harvest30Day', label: '30-Day Total Harvest', defaultVisible: true },
          { id: 'layEfficiency7Day', label: '7-Day Lay Efficiency', defaultVisible: true },
          { id: 'avgEggWeight', label: 'Average Egg Weight', defaultVisible: true },
          { id: 'shellIntegrity', label: 'Shell Grade Integrity', defaultVisible: true },
        ],
      },
      {
        id: 'production_trend',
        title: 'Historical Daily Egg Yield & Lay Rate',
        description: 'Multi-day output trend bar chart with efficiency tooltips.',
        defaultVisible: true,
        items: [
          { id: 'windowButtons', label: '7 / 14 / 21 Day Selector', defaultVisible: true },
          { id: 'barValues', label: 'Egg Counts Above Bars', defaultVisible: true },
          { id: 'hoverTooltip', label: 'Hover Laying Rate Tooltip', defaultVisible: true },
        ],
      },
      {
        id: 'egg_attributes',
        title: 'Egg Physical Attributes Matrix',
        description: 'Breakdowns for size grades, shell colors, and shell shapes.',
        defaultVisible: true,
        items: [
          { id: 'sizeDistribution', label: 'Egg Size Grade Distribution', defaultVisible: true },
          { id: 'colorDistribution', label: 'Shell Color Pigmentation', defaultVisible: true },
          { id: 'shapeDistribution', label: 'Shell Morphology / Shape', defaultVisible: true },
        ],
      },
      {
        id: 'coop_benchmark',
        title: 'Multi-Coop Comparative Performance',
        description: 'Side-by-side table comparing occupancy, egg share, and efficiency by coop.',
        defaultVisible: true,
        items: [
          { id: 'birdsCapacityCol', label: 'Birds / Capacity Column', defaultVisible: true },
          { id: 'occupancyCol', label: 'Occupancy Column', defaultVisible: true },
          { id: 'totalEggsCol', label: 'Total Eggs Column', defaultVisible: true },
          { id: 'flockShareCol', label: 'Flock Share Column', defaultVisible: true },
          { id: 'dailyAvgCol', label: 'Daily Average Column', defaultVisible: true },
          { id: 'efficiencyCol', label: 'Laying Efficiency Column', defaultVisible: true },
        ],
      },
      {
        id: 'breed_benchmark',
        title: 'Breed Yield & Shell Quality Benchmarking',
        description: 'Table benchmarking flock breeds by target output, weight, and harvests.',
        defaultVisible: true,
        items: [
          { id: 'purposeOriginCol', label: 'Purpose & Origin Column', defaultVisible: true },
          { id: 'flockCountCol', label: 'Flock Count Column', defaultVisible: true },
          { id: 'shellPigmentCol', label: 'Egg Shell Pigment Column', defaultVisible: true },
          { id: 'annualTargetCol', label: 'Standard Annual Target Column', defaultVisible: true },
          { id: 'avgWeightCol', label: 'Avg Egg Weight Column', defaultVisible: true },
          { id: 'harvestsCol', label: 'Identified Harvests Column', defaultVisible: true },
        ],
      },
    ],
  },
};

export function getDefaultTabLayout(tabId: AppTabId): TabLayoutConfig {
  const schema = TAB_CUSTOMIZATION_SCHEMAS[tabId];
  const sectionOrder = schema.sections.map((s) => s.id);
  const hiddenSections = schema.sections
    .filter((s) => !s.defaultVisible)
    .map((s) => s.id);
  const sectionItems: Record<string, Record<string, boolean>> = {};

  schema.sections.forEach((section) => {
    sectionItems[section.id] = {};
    section.items.forEach((item) => {
      sectionItems[section.id][item.id] = item.defaultVisible;
    });
  });

  return {
    sectionOrder,
    hiddenSections,
    sectionItems,
  };
}

export function normalizeTabLayout(
  tabId: AppTabId,
  saved?: Partial<TabLayoutConfig>
): TabLayoutConfig {
  const defaults = getDefaultTabLayout(tabId);
  const schema = TAB_CUSTOMIZATION_SCHEMAS[tabId];
  const validSectionIds = new Set(schema.sections.map((s) => s.id));

  // Preserve valid saved order and append any newly added schema sections at the end
  const savedOrder = Array.isArray(saved?.sectionOrder)
    ? saved.sectionOrder.filter((id) => validSectionIds.has(id))
    : [];
  const missingSections = defaults.sectionOrder.filter((id) => !savedOrder.includes(id));
  const sectionOrder = [...savedOrder, ...missingSections];

  const hiddenSections = Array.isArray(saved?.hiddenSections)
    ? saved.hiddenSections.filter((id) => validSectionIds.has(id))
    : defaults.hiddenSections;

  const sectionItems: Record<string, Record<string, boolean>> = {};
  schema.sections.forEach((section) => {
    const savedSectionItems = saved?.sectionItems?.[section.id] || {};
    sectionItems[section.id] = {};
    section.items.forEach((item) => {
      sectionItems[section.id][item.id] =
        typeof savedSectionItems[item.id] === 'boolean'
          ? savedSectionItems[item.id]
          : item.defaultVisible;
    });
  });

  return {
    sectionOrder,
    hiddenSections,
    sectionItems,
  };
}
