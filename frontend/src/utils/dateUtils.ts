/**
 * Date and Time utilities for Nexora CRM
 * Provides consistent date handling in IST (Asia/Kolkata) and dynamic calendar calculations.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getToday(): Date {
  return new Date();
}

/**
 * Format as "19 Aug 2026"
 */
export function formatDateIST(dateInput?: Date | string | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) return String(dateInput);

  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day < 10 ? '0' + day : day} ${month} ${year}`;
}

/**
 * Format as "19 August 2026 • IST (Asia/Kolkata)"
 */
export function formatDateFullIST(dateInput?: Date | string | null): string {
  const d = dateInput ? (typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput) : new Date();
  if (!d || isNaN(d.getTime())) return '';

  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year} • IST (Asia/Kolkata)`;
}

/**
 * Format as "YYYY-MM-DD"
 */
export function formatDateISO(dateInput?: Date | string | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format month and year as "August 2026"
 */
export function formatMonthYear(dateInput: Date): string {
  return `${MONTH_NAMES[dateInput.getMonth()]} ${dateInput.getFullYear()}`;
}

/**
 * Parses date string in formats: "YYYY-MM-DD", "19 Aug 2026", "19 August 2026", etc.
 */
export function parseDateString(str: string): Date {
  if (!str) return new Date();

  // If standard ISO "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // If "19 Aug 2026" or "19 August 2026"
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);

    const monthIndex = MONTH_SHORT.findIndex(m => m.toLowerCase() === monthStr) !== -1
      ? MONTH_SHORT.findIndex(m => m.toLowerCase() === monthStr)
      : MONTH_NAMES.findIndex(m => m.toLowerCase() === monthStr);

    if (!isNaN(day) && monthIndex !== -1 && !isNaN(year)) {
      return new Date(year, monthIndex, day);
    }
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Checks if two date inputs fall on the exact same calendar day
 */
export function isSameDay(d1?: Date | string | null, d2?: Date | string | null): boolean {
  if (!d1 || !d2) return false;
  const date1 = typeof d1 === 'string' ? parseDateString(d1) : d1;
  const date2 = typeof d2 === 'string' ? parseDateString(d2) : d2;
  if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) return false;

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Checks if date is today
 */
export function isTodayDate(d?: Date | string | null): boolean {
  return isSameDay(d, new Date());
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const res = new Date(date);
  res.setDate(res.getDate() + days);
  return res;
}

/**
 * Add months to date
 */
export function addMonths(date: Date, months: number): Date {
  const res = new Date(date);
  res.setMonth(res.getMonth() + months);
  return res;
}

/**
 * Get standard 12-hour time string like "10:30 AM"
 */
export function formatTime12h(date?: Date): string {
  const d = date || new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  return strTime;
}

export interface CalendarDayCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Generates a grid cell array for Month view with Monday as first day of week
 */
export function getMonthMatrix(currentDate: Date): CalendarDayCell[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  // We want Mon = 0, Sun = 6
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const cells: CalendarDayCell[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    cells.push({
      date,
      dateStr: formatDateISO(date),
      dayNum: day,
      isCurrentMonth: false,
      isToday: isTodayDate(date)
    });
  }

  // Current month days
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    const date = new Date(year, month, d);
    cells.push({
      date,
      dateStr: formatDateISO(date),
      dayNum: d,
      isCurrentMonth: true,
      isToday: isTodayDate(date)
    });
  }

  // Next month leading days to complete the 7-column grid (up to multiple of 7)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    cells.push({
      date,
      dateStr: formatDateISO(date),
      dayNum: d,
      isCurrentMonth: false,
      isToday: isTodayDate(date)
    });
  }

  return cells;
}

/**
 * Gets the 7 days of the week containing the specified date (starting on Monday)
 */
export function getWeekDays(currentDate: Date): CalendarDayCell[] {
  let dayOfWeek = currentDate.getDay() - 1; // 0 = Mon, 6 = Sun
  if (dayOfWeek === -1) dayOfWeek = 6;

  const monday = addDays(currentDate, -dayOfWeek);
  const days: CalendarDayCell[] = [];

  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    days.push({
      date: d,
      dateStr: formatDateISO(d),
      dayNum: d.getDate(),
      isCurrentMonth: d.getMonth() === currentDate.getMonth(),
      isToday: isTodayDate(d)
    });
  }

  return days;
}
