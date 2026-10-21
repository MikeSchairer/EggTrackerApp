/**
 * Date and TimeZone utility for Flocker.
 * Prevents UTC day-rollover bugs where evening times display as "tomorrow".
 */

export const TIMEZONE_STORAGE_KEY = 'flocker_homestead_timezone';

export interface TimeZoneOption {
  value: string;
  label: string;
  group: string;
}

export const POPULAR_TIMEZONES: TimeZoneOption[] = [
  // United States & Canada
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada - Los Angeles, Seattle)', group: 'US & Canada' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada - Denver, Salt Lake)', group: 'US & Canada' },
  { value: 'America/Phoenix', label: 'Arizona Time (Phoenix - no DST)', group: 'US & Canada' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada - Chicago, Dallas)', group: 'US & Canada' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada - New York, Atlanta)', group: 'US & Canada' },
  { value: 'America/Anchorage', label: 'Alaska Time (Anchorage)', group: 'US & Canada' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (Honolulu)', group: 'US & Canada' },
  { value: 'America/Toronto', label: 'Eastern Time (Canada - Toronto, Montreal)', group: 'US & Canada' },
  { value: 'America/Vancouver', label: 'Pacific Time (Canada - Vancouver)', group: 'US & Canada' },
  
  // Europe & UK
  { value: 'Europe/London', label: 'London, Dublin, Edinburgh (GMT/BST)', group: 'Europe & UK' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome, Madrid (CET/CEST)', group: 'Europe & UK' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam, Brussels (CET/CEST)', group: 'Europe & UK' },
  { value: 'Europe/Athens', label: 'Athens, Helsinki, Bucharest (EET/EEST)', group: 'Europe & UK' },

  // Australia & New Zealand
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne, Canberra (AEST/AEDT)', group: 'Australia & Pacific' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST - no DST)', group: 'Australia & Pacific' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)', group: 'Australia & Pacific' },
  { value: 'Australia/Perth', label: 'Perth (AWST)', group: 'Australia & Pacific' },
  { value: 'Pacific/Auckland', label: 'Auckland, Wellington (NZST/NZDT)', group: 'Australia & Pacific' },

  // Asia & Other
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', group: 'Asia & Other' },
  { value: 'Asia/Singapore', label: 'Singapore, Hong Kong (SGT/HKT)', group: 'Asia & Other' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', group: 'Americas' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', group: 'Universal' },
];

/**
 * Returns the currently configured timezone, or auto-detects from the browser.
 */
export function getTimeZone(): string {
  try {
    const saved = localStorage.getItem(TIMEZONE_STORAGE_KEY);
    if (saved && isValidTimeZone(saved)) {
      return saved;
    }
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected && isValidTimeZone(detected)) {
      return detected;
    }
  } catch (err) {
    console.warn('Error detecting timezone', err);
  }
  return 'America/Los_Angeles';
}

/**
 * Persists the chosen timezone in localStorage.
 */
export function setTimeZone(tz: string): void {
  try {
    if (isValidTimeZone(tz)) {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
    }
  } catch (err) {
    console.warn('Error saving timezone', err);
  }
}

/**
 * Validates if a timezone string is valid according to the Intl API.
 */
export function isValidTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns today's date in YYYY-MM-DD format for the specified or configured timezone.
 * Uses 'en-CA' locale which standardizes to ISO 8601 YYYY-MM-DD.
 */
export function getTodayDateStr(timeZone?: string): string {
  const tz = timeZone || getTimeZone();
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Returns the current time in HH:MM (24-hour format) for the specified or configured timezone.
 */
export function getCurrentTimeStr(timeZone?: string): string {
  const tz = timeZone || getTimeZone();
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

/**
 * Formats current date and time with human readable preview.
 */
export function getCurrentDateTimePreview(timeZone?: string): {
  dateStr: string;
  timeStr: string;
  readableDate: string;
  readableTime: string;
  timeZoneName: string;
} {
  const tz = timeZone || getTimeZone();
  const now = new Date();

  let dateStr = getTodayDateStr(tz);
  let timeStr = getCurrentTimeStr(tz);
  let readableDate = '';
  let readableTime = '';
  let timeZoneName = tz;

  try {
    readableDate = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(now);

    readableTime = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(now);

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart) {
      timeZoneName = tzPart.value;
    }
  } catch {
    readableDate = dateStr;
    readableTime = timeStr;
  }

  return {
    dateStr,
    timeStr,
    readableDate,
    readableTime,
    timeZoneName,
  };
}

/**
 * Safely parses a YYYY-MM-DD string into a Date object at noon (12:00:00)
 * to prevent date-boundary and DST shifts.
 */
export function parseDateSafe(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(year, month, day, 12, 0, 0);
}

/**
 * Formats a YYYY-MM-DD string into a human-readable display string without UTC day shift.
 */
export function formatDisplayDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
): string {
  try {
    const d = parseDateSafe(dateStr);
    return new Intl.DateTimeFormat('en-US', options).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Shifts a YYYY-MM-DD date by a given number of days.
 */
export function shiftDate(dateStr: string, daysDelta: number): string {
  try {
    const d = parseDateSafe(dateStr);
    d.setDate(d.getDate() + daysDelta);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Generates an array of YYYY-MM-DD date strings for the given window ending on endDateStr.
 */
export function getDateRange(endDateStr: string, count: number): string[] {
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    dates.push(shiftDate(endDateStr, -i));
  }
  return dates;
}
