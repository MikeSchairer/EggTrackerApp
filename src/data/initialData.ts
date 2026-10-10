import { 
  Coop, 
  Chicken, 
  EggLog, 
  FeedItem, 
  EggBatch, 
  IncubationBatch, 
  HealthRecord, 
  FinancialTransaction, 
  PredatorIncident, 
  SecurityChecklist, 
  SmartReminder, 
  CoopEnvironmentLog, 
  CoopMaintenanceItem 
} from '../types/flock';

// Clean initial datasets (example data removed as requested)
export const INITIAL_COOPS: Coop[] = [];

export const INITIAL_CHICKENS: Chicken[] = [];

export function generateInitialEggLogs(): EggLog[] {
  return [];
}

export const INITIAL_FEED_INVENTORY: FeedItem[] = [];

export const INITIAL_EGG_BATCHES: EggBatch[] = [];

export const INITIAL_INCUBATION_BATCHES: IncubationBatch[] = [];

export const INITIAL_HEALTH_RECORDS: HealthRecord[] = [];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [];

export const INITIAL_PREDATOR_INCIDENTS: PredatorIncident[] = [];

export const INITIAL_SECURITY_CHECKLISTS: SecurityChecklist[] = [];

export const INITIAL_REMINDERS: SmartReminder[] = [];

export const INITIAL_COOP_ENV_LOGS: CoopEnvironmentLog[] = [];

export const INITIAL_COOP_MAINTENANCE: CoopMaintenanceItem[] = [];
