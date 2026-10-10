export type EggSize = 'peewee' | 'small' | 'medium' | 'large' | 'extra_large' | 'jumbo';

export type EggColor = 
  | 'dark_chocolate' 
  | 'sky_blue' 
  | 'olive_green' 
  | 'terracotta_brown' 
  | 'cream_tinted' 
  | 'chalk_white' 
  | 'speckled_brown'
  | 'pinkish_tint';

export type EggShape = 
  | 'classic_oval' 
  | 'pointed' 
  | 'elongated' 
  | 'round' 
  | 'torpedo' 
  | 'ridged_textured';

export type EggCondition = 'clean_intact' | 'dirty' | 'double_yolk' | 'soft_shell' | 'hairline_crack' | 'misshapen';

export type LifeStage = 'chick' | 'pullet' | 'point_of_lay' | 'active_layer' | 'broody' | 'molting' | 'retired' | 'rooster';

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
  photoUrl?: string;
  avatarColor: string;
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

export interface Coop {
  id: string;
  name: string;
  locationDescription: string;
  capacity: number;
  nestingBoxes: number;
  roostLengthFeet: number;
  beddingType: 'Pine Shavings' | 'Hemp Fiber' | 'Clean Straw' | 'Washed Sand';
  lastCleanedDate: string; // YYYY-MM-DD
  targetTempFahrenheit?: number;
  notes?: string;
  colorTheme: string;
}

export interface FlockState {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  selectedCoopId: string | 'all';
}
