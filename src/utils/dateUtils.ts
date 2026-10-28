/**
 * Date Utility Functions for PlannerApp
 * Format: dd/mm/yyyy
 */

/**
 * Pads single digit with leading zero
 */
const padZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

/**
 * Formats a Date object to dd/mm/yyyy
 */
export const formatDate = (date: Date): string => {
  const day = padZero(date.getDate());
  const month = padZero(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Parse dd/mm/yyyy string into Date object set at 00:00:00.000.
 * Returns null if format or values are invalid.
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    return null;
  }

  // Check actual calendar validity (e.g. 31/02/2026 or 29/02/2025)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Get today's Date at 00:00:00.000
 */
export const getTodayMidnight = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Strict validation of date string for input form.
 * Returns error string or null if valid.
 */
export const validateDueDate = (
  dateStr: string,
  isEditMode: boolean = false
): string | null => {
  if (!dateStr || !dateStr.trim()) {
    return 'Hạn hoàn thành không được để trống';
  }

  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return 'Hạn hoàn thành phải có định dạng dd/mm/yyyy (ví dụ: 30/11/2026)';
  }

  const parsed = parseDate(trimmed);
  if (!parsed) {
    return 'Ngày không có thật trong lịch (ví dụ: 31/02/2026 là không hợp lệ)';
  }

  // Khi thêm mới: hạn không được trước ngày hôm nay
  if (!isEditMode) {
    const today = getTodayMidnight();
    if (parsed.getTime() < today.getTime()) {
      return 'Hạn hoàn thành không được trước ngày hôm nay';
    }
  }

  return null;
};

/**
 * Checks if a task is overdue.
 * Rule: done is false and dueDate is before today.
 */
export const isTaskOverdue = (dueDateStr: string, done: boolean): boolean => {
  if (done) return false;
  const targetDate = parseDate(dueDateStr);
  if (!targetDate) return false;
  const today = getTodayMidnight();
  return targetDate.getTime() < today.getTime();
};

/**
 * Calculate the difference in calendar days between targetDate and today.
 * target - today:
 * < 0: Overdue
 * === 0: Due today
 * > 0: Days remaining
 */
export const getDaysDifference = (dueDateStr: string): number | null => {
  const target = parseDate(dueDateStr);
  if (!target) return null;
  const today = getTodayMidnight();
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Returns formatted status string for display:
 * - "Hạn hôm nay"
 * - "Còn X ngày"
 * - "Quá hạn X ngày"
 */
export const getDueStatusInfo = (
  dueDateStr: string,
  done: boolean
): {
  text: string;
  isOverdue: boolean;
  diffDays: number;
} => {
  const diff = getDaysDifference(dueDateStr);
  if (diff === null) {
    return { text: dueDateStr, isOverdue: false, diffDays: 0 };
  }

  if (diff < 0) {
    const absDays = Math.abs(diff);
    return {
      text: `Quá hạn ${absDays} ngày`,
      isOverdue: !done,
      diffDays: diff,
    };
  }

  if (diff === 0) {
    return {
      text: 'Hạn hôm nay',
      isOverdue: false,
      diffDays: 0,
    };
  }

  return {
    text: `Còn ${diff} ngày`,
    isOverdue: false,
    diffDays: diff,
  };
};

/**
 * Generates an offset date from today formatted as dd/mm/yyyy.
 * Used for generating realistic initial sample tasks.
 */
export const getRelativeDateString = (dayOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return formatDate(d);
};
