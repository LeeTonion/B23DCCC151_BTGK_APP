import {
  parseDate,
  validateDueDate,
  isTaskOverdue,
  getDueStatusInfo,
  getRelativeDateString,
} from '../src/utils/dateUtils';
import { getInitialSampleTasks } from '../src/utils/storage';

describe('Date Utilities & Validation', () => {
  test('parseDate correctly parses valid date', () => {
    const d = parseDate('28/10/2026');
    expect(d).not.toBeNull();
    expect(d?.getDate()).toBe(28);
    expect(d?.getMonth()).toBe(9); // 0-indexed: 9 = October
    expect(d?.getFullYear()).toBe(2026);
  });

  test('validateDueDate catches invalid format and fake calendar dates', () => {
    // Missing or invalid format
    expect(validateDueDate('')).toBe('Hạn hoàn thành không được để trống');
    expect(validateDueDate('2026-10-28')).toContain('định dạng dd/mm/yyyy');
    expect(validateDueDate('32/01/2026')).toContain('Ngày không có thật');

    // Fake date: 31/02/2026 (explicit exam requirement!)
    const feb31Err = validateDueDate('31/02/2026');
    expect(feb31Err).toBe(
      'Ngày không có thật trong lịch (ví dụ: 31/02/2026 là không hợp lệ)'
    );

    // Fake date: 29/02/2025 (not leap year)
    const feb29NonLeap = validateDueDate('29/02/2025');
    expect(feb29NonLeap).toBe(
      'Ngày không có thật trong lịch (ví dụ: 31/02/2026 là không hợp lệ)'
    );

    // Valid date in future
    const futureDate = getRelativeDateString(5);
    expect(validateDueDate(futureDate, false)).toBeNull();
  });

  test('validateDueDate rejects past dates when adding new task', () => {
    const yesterday = getRelativeDateString(-1);
    expect(validateDueDate(yesterday, false)).toBe(
      'Hạn hoàn thành không được trước ngày hôm nay'
    );

    // When editing, keeping or setting past date is allowed if valid date
    expect(validateDueDate(yesterday, true)).toBeNull();
  });

  test('isTaskOverdue correctly identifies overdue tasks', () => {
    const pastDate = getRelativeDateString(-3);
    const futureDate = getRelativeDateString(3);

    // Past date and not done => overdue
    expect(isTaskOverdue(pastDate, false)).toBe(true);

    // Past date and done => not overdue
    expect(isTaskOverdue(pastDate, true)).toBe(false);

    // Future date and not done => not overdue
    expect(isTaskOverdue(futureDate, false)).toBe(false);
  });

  test('getDueStatusInfo returns appropriate text', () => {
    const todayStr = getRelativeDateString(0);
    expect(getDueStatusInfo(todayStr, false).text).toBe('Hạn hôm nay');

    const past2Days = getRelativeDateString(-2);
    expect(getDueStatusInfo(past2Days, false).text).toBe('Quá hạn 2 ngày');

    const future3Days = getRelativeDateString(3);
    expect(getDueStatusInfo(future3Days, false).text).toBe('Còn 3 ngày');
  });

  test('Initial sample tasks contain at least 6 tasks with >=1 done and >=1 overdue', () => {
    const tasks = getInitialSampleTasks();
    expect(tasks.length).toBeGreaterThanOrEqual(6);

    const doneCount = tasks.filter((t) => t.done).length;
    expect(doneCount).toBeGreaterThanOrEqual(1);

    const overdueCount = tasks.filter((t) => isTaskOverdue(t.dueDate, t.done)).length;
    expect(overdueCount).toBeGreaterThanOrEqual(1);
  });
});
