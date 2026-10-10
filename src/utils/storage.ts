import { Coop, Chicken, EggLog, FlockState } from '../types/flock';
import { 
  INITIAL_COOPS, 
  INITIAL_CHICKENS, 
  generateInitialEggLogs,
  INITIAL_FEED_INVENTORY,
  INITIAL_EGG_BATCHES,
  INITIAL_INCUBATION_BATCHES,
  INITIAL_HEALTH_RECORDS,
  INITIAL_TRANSACTIONS,
  INITIAL_PREDATOR_INCIDENTS,
  INITIAL_SECURITY_CHECKLISTS,
  INITIAL_REMINDERS,
  INITIAL_COOP_ENV_LOGS,
  INITIAL_COOP_MAINTENANCE
} from '../data/initialData';

const STORAGE_KEY = 'flocker_homestead_state_v2';
const LEGACY_STORAGE_KEY = 'cluck_and_clutch_data_v1';

export const EMPTY_FLOCK_STATE: FlockState = {
  coops: [],
  chickens: [],
  eggLogs: [],
  selectedCoopId: 'all',
  feedInventory: [],
  eggBatches: [],
  incubationBatches: [],
  healthRecords: [],
  transactions: [],
  predatorIncidents: [],
  securityChecklists: [],
  reminders: [],
  coopEnvironmentLogs: [],
  coopMaintenanceItems: [],
};

export function loadFlockState(): FlockState {
  try {
    // Clear legacy example data if present
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If stored data contains previous example chickens or demo coops, purge to clean slate
      const hasDemoData = (
        (Array.isArray(parsed.chickens) && parsed.chickens.some((c: any) => 
          c.id === 'hen-pebble' || c.id === 'hen-dotty' || c.id === 'hen-winnie' ||
          c.id === 'hen-ruby' || c.id === 'hen-celeste' || c.id === 'hen-maple' ||
          c.id === 'hen-clover' || c.id === 'hen-opal' || c.id === 'hen-copper'
        )) ||
        (Array.isArray(parsed.coops) && parsed.coops.some((coop: any) => 
          coop.id === 'coop-meadow' || coop.id === 'coop-heritage-barn' || coop.id === 'coop-pullet-nursery'
        ))
      );
      if (hasDemoData) {
        saveFlockState(EMPTY_FLOCK_STATE);
        return { ...EMPTY_FLOCK_STATE };
      }

      if (Array.isArray(parsed.coops) && Array.isArray(parsed.chickens) && Array.isArray(parsed.eggLogs)) {
        return {
          coops: parsed.coops,
          chickens: parsed.chickens,
          eggLogs: parsed.eggLogs,
          selectedCoopId: parsed.selectedCoopId || 'all',
          feedInventory: Array.isArray(parsed.feedInventory) ? parsed.feedInventory : [],
          eggBatches: Array.isArray(parsed.eggBatches) ? parsed.eggBatches : [],
          incubationBatches: Array.isArray(parsed.incubationBatches) ? parsed.incubationBatches : [],
          healthRecords: Array.isArray(parsed.healthRecords) ? parsed.healthRecords : [],
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          predatorIncidents: Array.isArray(parsed.predatorIncidents) ? parsed.predatorIncidents : [],
          securityChecklists: Array.isArray(parsed.securityChecklists) ? parsed.securityChecklists : [],
          reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
          coopEnvironmentLogs: Array.isArray(parsed.coopEnvironmentLogs) ? parsed.coopEnvironmentLogs : [],
          coopMaintenanceItems: Array.isArray(parsed.coopMaintenanceItems) ? parsed.coopMaintenanceItems : [],
        };
      }
    }
  } catch (err) {
    console.error('Failed to parse saved flock state from localStorage', err);
  }

  // Default to clean empty state (no example data)
  const emptyState: FlockState = { ...EMPTY_FLOCK_STATE };
  saveFlockState(emptyState);
  return emptyState;
}

export function saveFlockState(state: FlockState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save flock state to localStorage', err);
  }
}

export function clearAllFlockData(): FlockState {
  const empty = { ...EMPTY_FLOCK_STATE };
  saveFlockState(empty);
  return empty;
}

export function resetToSampleData(): FlockState {
  const sampleState: FlockState = {
    coops: INITIAL_COOPS,
    chickens: INITIAL_CHICKENS,
    eggLogs: generateInitialEggLogs(),
    selectedCoopId: 'all',
    feedInventory: INITIAL_FEED_INVENTORY,
    eggBatches: INITIAL_EGG_BATCHES,
    incubationBatches: INITIAL_INCUBATION_BATCHES,
    healthRecords: INITIAL_HEALTH_RECORDS,
    transactions: INITIAL_TRANSACTIONS,
    predatorIncidents: INITIAL_PREDATOR_INCIDENTS,
    securityChecklists: INITIAL_SECURITY_CHECKLISTS,
    reminders: INITIAL_REMINDERS,
    coopEnvironmentLogs: INITIAL_COOP_ENV_LOGS,
    coopMaintenanceItems: INITIAL_COOP_MAINTENANCE,
  };
  saveFlockState(sampleState);
  return sampleState;
}

export function exportBackupJson(state: FlockState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `flocker-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportEggsCsv(eggLogs: EggLog[], coops: Coop[]): void {
  const coopMap = new Map(coops.map(c => [c.id, c.name]));
  const headers = ['Log ID', 'Date', 'Time', 'Coop Name', 'Total Eggs', 'Broken Count', 'Weather', 'Egg Sizes', 'Egg Colors'];
  
  const rows = eggLogs.map(log => {
    const coopName = coopMap.get(log.coopId) || 'Unknown Coop';
    const sizes = log.eggs.map(e => e.size).join('; ');
    const colors = log.eggs.map(e => e.color).join('; ');

    return [
      log.id,
      log.date,
      log.time || '',
      `"${coopName}"`,
      log.totalEggs,
      log.brokenCount,
      log.weather || '',
      `"${sizes}"`,
      `"${colors}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodeURI(csvContent));
  downloadAnchor.setAttribute('download', `flocker-eggs-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
