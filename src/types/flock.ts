export type EggSize = 'peewee' | 'small' | 'medium' | 'large' | 'extra_large' | 'jumbo';

export type EggColor = 
  | 'dark_chocolate' 
  | 'sky_blue' 
  | 'olive_green' 
  | 'terracotta_brown' 
  | 'cream_tinted' 
  | 'chalk_white' 
  | 'speckled_brown'
  | 'pinkish_tint'
  | 'mint_green'
  | 'aqua'
  | 'porcelain_white';

export type EggShape = 
  | 'classic_oval' 
  | 'pointed' 
  | 'elongated' 
  | 'round' 
  | 'torpedo' 
  | 'ridged_textured';

export type EggCondition = 
  | 'clean_intact' 
  | 'dirty' 
  | 'double_yolk' 
  | 'soft_shell' 
  | 'hairline_crack' 
  | 'cracked' 
  | 'eaten' 
  | 'sold' 
  | 'incubated' 
  | 'misshapen';

export type LifeStage = 'chick' | 'pullet' | 'point_of_lay' | 'active_layer' | 'broody' | 'molting' | 'retired' | 'rooster';

export type BirdStatus = 'active' | 'deceased' | 'sold' | 'rehomed';

export interface BreedInfo {
  id: string;
  name: string;
  aliases?: string[];
  origin: string;
  purpose: 'Egg Layer' | 'Dual Purpose' | 'Ornamental' | 'Meat';
  classification: 'Standard' | 'Bantam' | 'Heritage' | 'Hybrid';
  combType: 'Single' | 'Pea' | 'Rose' | 'Walnut' | 'Cushion' | 'V-comb';
  eggColorType: EggColor;
  eggColorDisplay: string;
  expectedAnnualEggs: number; // e.g. 260
  expectedEggSize: EggSize;
  standardAdultHenWeightGrams: number; // e.g. 2900g (~6.5 lbs)
  standardAdultRoosterWeightGrams: number;
  coldHardy: boolean;
  heatTolerant: boolean;
  temperament: string;
  description: string;
  // Standard growth milestone weights in grams [4wks, 8wks, 12wks, 16wks, 20wks, adult(24wks+)]
  growthMilestones: {
    week4: number;
    week8: number;
    week12: number;
    week16: number;
    week20: number;
    adult: number;
  };
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightGrams: number;
  ageWeeks: number;
  featheringStage: 'chick_down' | 'partial_plumage' | 'full_plumage' | 'molting';
  notes?: string;
}

export interface Chicken {
  id: string;
  name: string;
  legBandId?: string;
  bandColor?: string;
  breedId: string;
  coopId: string;
  hatchDate: string; // YYYY-MM-DD
  gender: 'hen' | 'rooster';
  lifeStage: LifeStage;
  status?: BirdStatus;
  statusDate?: string;
  statusNotes?: string;
  photoUrl?: string;
  defaultEggColor?: EggColor;
  avatarColor: string;
  colorDescription?: string;
  weightRecords: WeightRecord[];
  notes?: string;
  isFavorite?: boolean;
}

export interface EggItem {
  id: string;
  size: EggSize;
  color: EggColor;
  shape: EggShape;
  weightGrams?: number;
  condition: EggCondition;
  chickenId?: string; // Optional if known layer
}

export interface EggLog {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  coopId: string;
  totalEggs: number;
  brokenCount: number;
  eggs: EggItem[];
  weather?: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Cold Snap' | 'Heatwave';
  notes?: string;
}

export interface EggBatch {
  id: string;
  batchCode: string; // e.g. BATCH-2026-10-09
  collectionDate: string; // YYYY-MM-DD
  count: number;
  storageLocation: 'countertop' | 'refrigerated';
  washed: boolean;
  cartonSize?: number; // 6, 12, 18
  notes?: string;
  soldCount?: number;
}

export interface Coop {
  id: string;
  name: string;
  locationDescription: string;
  capacity: number;
  nestingBoxes: number;
  roostLengthFeet: number;
  runSquareFeet?: number;
  predatorMeshType?: string;
  beddingType: 'Pine Shavings' | 'Hemp Fiber' | 'Clean Straw' | 'Washed Sand';
  lastCleanedDate: string; // YYYY-MM-DD
  cleaningIntervalDays?: number; // default e.g. 14
  targetTempFahrenheit?: number;
  notes?: string;
  colorTheme: string;
}

export interface CoopEnvironmentLog {
  id: string;
  coopId: string;
  date: string; // YYYY-MM-DD
  time?: string;
  temperatureF: number;
  humidityPercent: number;
  ventilationLevel: 'optimal' | 'drafty' | 'stuffy' | 'closed_freeze';
  notes?: string;
}

export interface CoopMaintenanceItem {
  id: string;
  coopId: string;
  taskName: string;
  category: 'cleaning' | 'feeder_waterer' | 'security' | 'bedding' | 'repairs';
  frequencyDays: number;
  lastCompletedDate: string;
  nextDueDate: string;
  completed: boolean;
}

export interface FeedItem {
  id: string;
  name: string;
  category: 'layer_feed' | 'chick_starter' | 'scratch_grain' | 'grower' | 'grit' | 'oyster_shell' | 'bedding' | 'supplement' | 'first_aid';
  brand?: string;
  currentQuantityLbs: number;
  lowStockThresholdLbs: number;
  costPerBag: number;
  bagWeightLbs: number;
  purchaseDate: string;
  notes?: string;
}

export interface CandlingRecord {
  day: number; // 7, 14, 18
  date: string;
  fertileCount: number;
  clearInfertileCount: number;
  bloodRingCount: number;
  quitterCount: number;
  notes?: string;
}

export interface IncubationBatch {
  id: string;
  batchName: string;
  incubatorModel?: string;
  settingDate: string; // YYYY-MM-DD
  expectedHatchDate: string; // settingDate + 21 days
  lockdownDate: string; // settingDate + 18 days
  eggsSetCount: number;
  breedIds?: string[];
  targetTempF: number; // e.g. 99.5
  targetHumidityPercent: number; // 45-50% early, 65-70% lockdown
  dailyTurnings: { date: string; turnsCount: number }[];
  candlingRecords: CandlingRecord[];
  outcomes?: {
    hatched: number;
    unhatched: number;
    pippedNotHatched: number;
  };
  status: 'incubating' | 'lockdown' | 'hatching' | 'completed';
  notes?: string;
}

export interface HealthRecord {
  id: string;
  chickenId: string;
  date: string;
  type: 'routine_check' | 'symptom' | 'injury' | 'medication' | 'vaccination' | 'vet_visit' | 'recovery';
  title: string;
  symptoms?: string[];
  treatmentGiven?: string;
  medicationName?: string;
  dosage?: string;
  withdrawalDaysEggs?: number;
  outcome: 'monitoring' | 'recovering' | 'resolved' | 'chronic';
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'egg_sales' | 'bird_sales' | 'hatching_eggs' | 'feed' | 'bedding' | 'supplies_meds' | 'equipment' | 'coop_infrastructure';
  title: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}

export interface PredatorIncident {
  id: string;
  date: string;
  timeOfDay: 'dawn' | 'daylight' | 'dusk' | 'night';
  predatorType: 'Hawk / Raptor' | 'Raccoon' | 'Fox' | 'Coyote' | 'Possum' | 'Snake' | 'Owl' | 'Rat / Rodent' | 'Stray Dog' | 'Unknown';
  coopId?: string;
  severity: 'sighting' | 'stalking_run' | 'damage_attempt' | 'breach_prevented';
  damageReport?: string;
  actionTaken: string;
  notes?: string;
}

export interface SecurityChecklist {
  id: string;
  date: string;
  automaticDoorConfirmed: boolean;
  windowsLatched: boolean;
  predatorApronChecked: boolean;
  feedBucketsLocked: boolean;
  watererCleanAndUnfrozen: boolean;
  roostHeadcountConfirmed: boolean;
  notes?: string;
}

export interface SmartReminder {
  id: string;
  title: string;
  category: 'egg_collection' | 'coop_clean' | 'feed_refill' | 'bedding_change' | 'water_check' | 'health_check' | 'vaccination' | 'incubator_turn';
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  recurringDays?: number;
  targetId?: string;
  notes?: string;
}

export interface FlockState {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  selectedCoopId: string | 'all';
  feedInventory?: FeedItem[];
  eggBatches?: EggBatch[];
  incubationBatches?: IncubationBatch[];
  healthRecords?: HealthRecord[];
  transactions?: FinancialTransaction[];
  predatorIncidents?: PredatorIncident[];
  securityChecklists?: SecurityChecklist[];
  reminders?: SmartReminder[];
  coopEnvironmentLogs?: CoopEnvironmentLog[];
  coopMaintenanceItems?: CoopMaintenanceItem[];
  timezone?: string;
}
