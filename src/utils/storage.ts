import { Coop, Chicken, EggLog, FlockState } from '../types/flock';
import { INITIAL_COOPS, INITIAL_CHICKENS, generateInitialEggLogs } from '../data/initialData';

const STORAGE_KEY = 'cluck_and_clutch_data_v1';

export function loadFlockState(): FlockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.coops) && Array.isArray(parsed.chickens) && Array.isArray(parsed.eggLogs)) {
        return {
          coops: parsed.coops,
          chickens: parsed.chickens,
          eggLogs: parsed.eggLogs,
          selectedCoopId: parsed.selectedCoopId || 'all',
        };
      }
    }
  } catch (err) {
    console.error('Failed to parse saved flock state from localStorage', err);
  }

  // Fallback to fresh initial data
  const state: FlockState = {
    coops: INITIAL_COOPS,
    chickens: INITIAL_CHICKENS,
    eggLogs: generateInitialEggLogs(),
    selectedCoopId: 'all',
  };
  saveFlockState(state);
  return state;
}

export function saveFlockState(state: FlockState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save flock state to localStorage', err);
  }
}

export function resetToSampleData(): FlockState {
  const freshState: FlockState = {
    coops: INITIAL_COOPS,
    chickens: INITIAL_CHICKENS,
    eggLogs: generateInitialEggLogs(),
    selectedCoopId: 'all',
  };
  saveFlockState(freshState);
  return freshState;
}

export function exportBackupJson(state: FlockState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `flock_records_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportEggsCsv(eggLogs: EggLog[], chickens: Chicken[], coops: Coop[]): void {
  const coopMap = new Map(coops.map(c => [c.id, c.name]));
  const chickenMap = new Map(chickens.map(c => [c.id, c.name]));

  const headers = ['Date', 'Time', 'Coop', 'Total_Eggs', 'Broken_Eggs', 'Egg_ID', 'Size', 'Color', 'Shape', 'Weight_Grams', 'Condition', 'Layer_Hen'];
  const rows: string[] = [headers.join(',')];

  eggLogs.forEach(log => {
    const coopName = coopMap.get(log.coopId) || log.coopId;
    if (log.eggs.length === 0) {
      rows.push([
        log.date,
        log.time || '',
        `"${coopName}"`,
        log.totalEggs,
        log.brokenCount,
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ].join(','));
    } else {
      log.eggs.forEach(egg => {
        const henName = egg.chickenId ? (chickenMap.get(egg.chickenId) || egg.chickenId) : 'Unassigned';
        rows.push([
          log.date,
          log.time || '',
          `"${coopName}"`,
          log.totalEggs,
          log.brokenCount,
          egg.id,
          egg.size,
          egg.color,
          egg.shape,
          egg.weightGrams || '',
          egg.condition,
          `"${henName}"`
        ].join(','));
      });
    }
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', `flock_egg_records_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
