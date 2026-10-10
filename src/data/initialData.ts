import { Coop, Chicken, EggLog, EggItem } from '../types/flock';

export const INITIAL_COOPS: Coop[] = [
  {
    id: 'coop-meadow',
    name: 'Meadow Haven Coop',
    locationDescription: 'Pasture perimeter facing East morning sun with covered outdoor run',
    capacity: 12,
    nestingBoxes: 4,
    roostLengthFeet: 14,
    beddingType: 'Pine Shavings',
    lastCleanedDate: '2026-10-04',
    targetTempFahrenheit: 65,
    notes: 'Primary layer housing. Automated solar door installed.',
    colorTheme: '#059669', // Emerald
  },
  {
    id: 'coop-heritage-barn',
    name: 'Heritage Barn Coop',
    locationDescription: 'Converted south wing of the cedar timber barn with wind protection',
    capacity: 10,
    nestingBoxes: 4,
    roostLengthFeet: 12,
    beddingType: 'Hemp Fiber',
    lastCleanedDate: '2026-09-28',
    targetTempFahrenheit: 62,
    notes: 'Deep litter bedding method. Houses heavy heritage breeds.',
    colorTheme: '#D97706', // Amber
  },
  {
    id: 'coop-pullet-nursery',
    name: 'Clover Run & Nursery',
    locationDescription: 'Enclosed juvenile paddock with low roosts and heating lamp hookup',
    capacity: 8,
    nestingBoxes: 2,
    roostLengthFeet: 8,
    beddingType: 'Clean Straw',
    lastCleanedDate: '2026-10-06',
    targetTempFahrenheit: 70,
    notes: 'Transition coop for growing pullets and weigh-in monitoring.',
    colorTheme: '#2563EB', // Blue
  },
];

export const INITIAL_CHICKENS: Chicken[] = [
  {
    id: 'hen-ruby',
    name: 'Ruby',
    legBandId: 'R-101',
    bandColor: 'Red',
    breedId: 'rhode-island-red',
    coopId: 'coop-meadow',
    hatchDate: '2025-04-12',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#B91C1C',
    isFavorite: true,
    notes: 'Flock matriarch. Clockwork daily layer, bold and friendly.',
    weightRecords: [
      { id: 'w-r1', date: '2025-05-10', weightGrams: 395, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-r2', date: '2025-06-07', weightGrams: 910, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-r3', date: '2025-07-05', weightGrams: 1580, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-r4', date: '2025-08-02', weightGrams: 2180, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-r5', date: '2025-08-30', weightGrams: 2650, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-r6', date: '2026-09-15', weightGrams: 2980, ageWeeks: 74, featheringStage: 'full_plumage', notes: 'Prime healthy adult weight.' },
    ],
  },
  {
    id: 'hen-celeste',
    name: 'Celeste',
    legBandId: 'B-204',
    bandColor: 'Sky Blue',
    breedId: 'ameraucana',
    coopId: 'coop-meadow',
    hatchDate: '2025-04-12',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#0284C7',
    isFavorite: true,
    notes: 'Gorgeous puffy beard and cheeks. Lays flawless pastel sky blue eggs.',
    weightRecords: [
      { id: 'w-c1', date: '2025-05-10', weightGrams: 320, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-c2', date: '2025-06-07', weightGrams: 740, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-c3', date: '2025-07-05', weightGrams: 1280, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-c4', date: '2025-08-02', weightGrams: 1820, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-c5', date: '2025-08-30', weightGrams: 2240, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-c6', date: '2026-09-20', weightGrams: 2520, ageWeeks: 75, featheringStage: 'full_plumage' },
    ],
  },
  {
    id: 'hen-margo',
    name: 'Margo',
    legBandId: 'M-308',
    bandColor: 'Brown',
    breedId: 'black-copper-marans',
    coopId: 'coop-heritage-barn',
    hatchDate: '2025-04-18',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#451A03',
    isFavorite: true,
    notes: 'Dark chocolate eggs with high gloss shell shine. Regal demeanor.',
    weightRecords: [
      { id: 'w-m1', date: '2025-05-16', weightGrams: 360, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-m2', date: '2025-06-13', weightGrams: 835, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-m3', date: '2025-07-11', weightGrams: 1470, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-m4', date: '2025-08-08', weightGrams: 2130, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-m5', date: '2025-09-05', weightGrams: 2590, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-m6', date: '2026-09-22', weightGrams: 2970, ageWeeks: 74, featheringStage: 'full_plumage' },
    ],
  },
  {
    id: 'hen-clover',
    name: 'Clover',
    legBandId: 'G-412',
    bandColor: 'Green',
    breedId: 'olive-egger',
    coopId: 'coop-meadow',
    hatchDate: '2025-05-02',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#15803D',
    isFavorite: false,
    notes: 'Deep olive green speckled eggs. Voracious bug hunter in the grass.',
    weightRecords: [
      { id: 'w-cl1', date: '2025-05-30', weightGrams: 345, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-cl2', date: '2025-06-27', weightGrams: 790, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-cl3', date: '2025-07-25', weightGrams: 1360, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-cl4', date: '2025-08-22', weightGrams: 1980, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-cl5', date: '2025-09-19', weightGrams: 2410, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-cl6', date: '2026-09-18', weightGrams: 2720, ageWeeks: 72, featheringStage: 'full_plumage' },
    ],
  },
  {
    id: 'hen-dotty',
    name: 'Dotty',
    legBandId: 'Z-501',
    bandColor: 'White',
    breedId: 'plymouth-barred-rock',
    coopId: 'coop-heritage-barn',
    hatchDate: '2025-04-18',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#334155',
    isFavorite: true,
    notes: 'Friendly lap chicken who runs to greet visitors. Steady layer through cold snaps.',
    weightRecords: [
      { id: 'w-d1', date: '2025-05-16', weightGrams: 430, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-d2', date: '2025-06-13', weightGrams: 1010, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-d3', date: '2025-07-11', weightGrams: 1750, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-d4', date: '2025-08-08', weightGrams: 2440, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-d5', date: '2025-09-05', weightGrams: 2990, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-d6', date: '2026-09-25', weightGrams: 3420, ageWeeks: 75, featheringStage: 'full_plumage' },
    ],
  },
  {
    id: 'hen-buttercup',
    name: 'Buttercup',
    legBandId: 'Y-602',
    bandColor: 'Yellow',
    breedId: 'buff-orpington',
    coopId: 'coop-heritage-barn',
    hatchDate: '2025-04-18',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#D97706',
    isFavorite: false,
    notes: 'Huge fluffy golden coat. Tendency toward broodiness in spring.',
    weightRecords: [
      { id: 'w-b1', date: '2025-05-16', weightGrams: 440, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-b2', date: '2025-06-13', weightGrams: 1040, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-b3', date: '2025-07-11', weightGrams: 1840, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-b4', date: '2025-08-08', weightGrams: 2540, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-b5', date: '2025-09-05', weightGrams: 3140, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-b6', date: '2026-09-28', weightGrams: 3620, ageWeeks: 75, featheringStage: 'full_plumage' },
    ],
  },
  {
    id: 'hen-bianca',
    name: 'Bianca',
    legBandId: 'W-710',
    bandColor: 'Silver',
    breedId: 'white-leghorn',
    coopId: 'coop-meadow',
    hatchDate: '2025-05-10',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#64748B',
    isFavorite: false,
    notes: 'Slender, high energy. Unbeatable production efficiency.',
    weightRecords: [
      { id: 'w-bi1', date: '2025-06-07', weightGrams: 285, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-bi2', date: '2025-07-05', weightGrams: 630, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-bi3', date: '2025-08-02', weightGrams: 1090, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-bi4', date: '2025-08-30', weightGrams: 1530, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-bi5', date: '2025-09-27', weightGrams: 1860, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-bi6', date: '2026-09-15', weightGrams: 2040, ageWeeks: 70, featheringStage: 'full_plumage' },
    ],
  },
  {
    id: 'hen-hazel',
    name: 'Hazel',
    legBandId: 'H-808',
    bandColor: 'Orange',
    breedId: 'welsummer',
    coopId: 'coop-heritage-barn',
    hatchDate: '2025-05-10',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#9A3412',
    isFavorite: false,
    notes: 'Produces dark terracotta eggs with dense chocolate freckles.',
    weightRecords: [
      { id: 'w-h1', date: '2025-06-07', weightGrams: 345, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-h2', date: '2025-07-05', weightGrams: 805, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-h3', date: '2025-08-02', weightGrams: 1395, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-h4', date: '2025-08-30', weightGrams: 1960, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-h5', date: '2025-09-27', weightGrams: 2410, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-h6', date: '2026-09-19', weightGrams: 2710, ageWeeks: 70, featheringStage: 'full_plumage' },
    ],
  },
  // Young pullets in nursery tracking active weekly growth!
  {
    id: 'pullet-pippa',
    name: 'Pippa',
    legBandId: 'P-901',
    bandColor: 'Purple',
    breedId: 'ameraucana',
    coopId: 'coop-pullet-nursery',
    hatchDate: '2026-06-20',
    gender: 'hen',
    lifeStage: 'point_of_lay',
    avatarColor: '#7C3AED',
    isFavorite: true,
    notes: 'Young pullet approaching point-of-lay! Weight tracking actively every 2 weeks.',
    weightRecords: [
      { id: 'w-pp1', date: '2026-07-18', weightGrams: 315, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-pp2', date: '2026-08-15', weightGrams: 730, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-pp3', date: '2026-09-12', weightGrams: 1260, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-pp4', date: '2026-10-03', weightGrams: 1720, ageWeeks: 15, featheringStage: 'full_plumage', notes: 'Comb beginning to redden nicely.' },
    ],
  },
  {
    id: 'pullet-freya',
    name: 'Freya',
    legBandId: 'F-902',
    bandColor: 'Pink',
    breedId: 'australorp',
    coopId: 'coop-pullet-nursery',
    hatchDate: '2026-07-04',
    gender: 'hen',
    lifeStage: 'pullet',
    avatarColor: '#1E293B',
    isFavorite: false,
    notes: 'Fast growing heritage pullet. Remarkable sheen already appearing on primary wing feathers.',
    weightRecords: [
      { id: 'w-fr1', date: '2026-08-01', weightGrams: 395, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-fr2', date: '2026-08-29', weightGrams: 920, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-fr3', date: '2026-09-26', weightGrams: 1610, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-fr4', date: '2026-10-06', weightGrams: 1840, ageWeeks: 14, featheringStage: 'full_plumage', notes: 'Gaining ~80g/week steady rate.' },
    ],
  },
  {
    id: 'hen-winnie',
    name: 'Winnie',
    legBandId: 'W-520',
    bandColor: 'Silver',
    breedId: 'silver-laced-wyandotte',
    coopId: 'coop-heritage-barn',
    hatchDate: '2025-04-18',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#475569',
    isFavorite: true,
    notes: 'Heritage Silver Laced Wyandotte. Stately plumage, frost-proof rose comb, and calm lap hen.',
    weightRecords: [
      { id: 'w-wn1', date: '2025-05-16', weightGrams: 385, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-wn2', date: '2025-06-13', weightGrams: 890, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-wn3', date: '2025-07-11', weightGrams: 1530, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-wn4', date: '2025-08-08', weightGrams: 2160, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-wn5', date: '2025-09-05', weightGrams: 2610, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-wn6', date: '2026-09-26', weightGrams: 2970, ageWeeks: 75, featheringStage: 'full_plumage' },
    ],
  },
  {
    id: 'hen-penelope',
    name: 'Penelope',
    legBandId: 'P-314',
    bandColor: 'White',
    breedId: 'white-crested-black-polish',
    coopId: 'coop-meadow',
    hatchDate: '2025-05-02',
    gender: 'hen',
    lifeStage: 'active_layer',
    avatarColor: '#0F172A',
    isFavorite: true,
    notes: 'Show-stopping white crested topknot. Inquisitive personality and consistent chalk white egg layer.',
    weightRecords: [
      { id: 'w-pn1', date: '2025-05-30', weightGrams: 275, ageWeeks: 4, featheringStage: 'partial_plumage' },
      { id: 'w-pn2', date: '2025-06-27', weightGrams: 625, ageWeeks: 8, featheringStage: 'full_plumage' },
      { id: 'w-pn3', date: '2025-07-25', weightGrams: 1085, ageWeeks: 12, featheringStage: 'full_plumage' },
      { id: 'w-pn4', date: '2025-08-22', weightGrams: 1550, ageWeeks: 16, featheringStage: 'full_plumage' },
      { id: 'w-pn5', date: '2025-09-19', weightGrams: 1860, ageWeeks: 20, featheringStage: 'full_plumage' },
      { id: 'w-pn6', date: '2026-09-24', weightGrams: 2060, ageWeeks: 73, featheringStage: 'full_plumage' },
    ],
  },
];

// Generate past 21 days of egg logs
export function generateInitialEggLogs(): EggLog[] {
  const logs: EggLog[] = [];
  const today = new Date('2026-10-09');

  for (let i = 20; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Meadow Coop log (4-5 hens laying: Ruby, Celeste, Clover, Bianca)
    const meadowEggs: EggItem[] = [
      {
        id: `egg-m-r-${i}`,
        size: 'large',
        color: 'terracotta_brown',
        shape: 'classic_oval',
        weightGrams: 54 + (i % 3),
        condition: 'clean_intact',
        chickenId: 'hen-ruby',
      },
      {
        id: `egg-m-c-${i}`,
        size: 'medium',
        color: 'sky_blue',
        shape: 'classic_oval',
        weightGrams: 47 + (i % 2),
        condition: 'clean_intact',
        chickenId: 'hen-celeste',
      },
      {
        id: `egg-m-cl-${i}`,
        size: 'large',
        color: 'olive_green',
        shape: 'pointed',
        weightGrams: 55 + (i % 4),
        condition: 'clean_intact',
        chickenId: 'hen-clover',
      },
      {
        id: `egg-m-b-${i}`,
        size: 'large',
        color: 'chalk_white',
        shape: 'elongated',
        weightGrams: 53 + (i % 3),
        condition: (i === 11) ? 'dirty' : 'clean_intact',
        chickenId: 'hen-bianca',
      },
    ];

    // Occasional 5th egg or bonus double yolk
    if (i % 5 === 0) {
      meadowEggs.push({
        id: `egg-m-extra-${i}`,
        size: 'extra_large',
        color: 'terracotta_brown',
        shape: 'round',
        weightGrams: 63,
        condition: 'double_yolk',
      });
    }

    logs.push({
      id: `log-meadow-${dateStr}`,
      date: dateStr,
      time: '08:45',
      coopId: 'coop-meadow',
      totalEggs: meadowEggs.length,
      brokenCount: 0,
      eggs: meadowEggs,
      weather: i % 4 === 0 ? 'Sunny' : (i % 3 === 0 ? 'Partly Cloudy' : 'Sunny'),
      notes: i === 0 ? "Morning collection. Clean shells throughout, roost boxes fluffed." : undefined,
    });

    // Heritage Barn Coop log (Dotty, Margo, Buttercup, Hazel)
    // Barn hens take occasional rest day (Marans & Orpington lay ~4-5 eggs/week)
    const barnEggs: EggItem[] = [];
    if (i % 7 !== 2) {
      barnEggs.push({
        id: `egg-b-d-${i}`,
        size: 'large',
        color: 'terracotta_brown',
        shape: 'classic_oval',
        weightGrams: 56 + (i % 3),
        condition: 'clean_intact',
        chickenId: 'hen-dotty',
      });
    }
    if (i % 6 !== 1) {
      barnEggs.push({
        id: `egg-b-m-${i}`,
        size: 'large',
        color: 'dark_chocolate',
        shape: 'pointed',
        weightGrams: 58 + (i % 2),
        condition: 'clean_intact',
        chickenId: 'hen-margo',
      });
    }
    if (i % 5 !== 3) {
      barnEggs.push({
        id: `egg-b-bt-${i}`,
        size: 'extra_large',
        color: 'pinkish_tint',
        shape: 'round',
        weightGrams: 61 + (i % 3),
        condition: 'clean_intact',
        chickenId: 'hen-buttercup',
      });
    }
    if (i % 4 !== 1) {
      barnEggs.push({
        id: `egg-b-hz-${i}`,
        size: 'large',
        color: 'speckled_brown',
        shape: 'classic_oval',
        weightGrams: 55 + (i % 2),
        condition: 'clean_intact',
        chickenId: 'hen-hazel',
      });
    }

    // A cracked egg on day 7 for authentic defect monitoring
    const broken = (i === 7) ? 1 : 0;
    if (broken > 0) {
      barnEggs.push({
        id: `egg-b-cracked-${i}`,
        size: 'large',
        color: 'terracotta_brown',
        shape: 'classic_oval',
        weightGrams: 54,
        condition: 'hairline_crack',
      });
    }

    logs.push({
      id: `log-barn-${dateStr}`,
      date: dateStr,
      time: '09:15',
      coopId: 'coop-heritage-barn',
      totalEggs: barnEggs.length,
      brokenCount: broken,
      eggs: barnEggs,
      weather: i % 5 === 0 ? 'Partly Cloudy' : 'Sunny',
      notes: broken > 0 ? 'One cracked shell found in lower nesting box.' : undefined,
    });
  }

  return logs;
}
