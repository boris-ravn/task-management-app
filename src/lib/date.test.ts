import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseDateLocal, isOverdue, formatDueDate } from './date';

// Built from local date parts, so "today" is 2026-06-15 in every timezone.
// Using an ISO/UTC instant here would reintroduce the very bug these helpers exist to avoid.
const FIXED_NOW = new Date(2026, 5, 15, 12, 0, 0);

describe('date helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('parseDateLocal', () => {
    it('parses a date-only string as local midnight', () => {
      const date = parseDateLocal('2026-09-01');

      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(8);
      expect(date.getDate()).toBe(1);
      expect(date.getHours()).toBe(0);
    });

    it('ignores the time portion of a full ISO string', () => {
      expect(parseDateLocal('2026-09-01T00:00:00.000Z').getTime()).toBe(
        parseDateLocal('2026-09-01').getTime(),
      );
    });

    it('does not shift the calendar day the way new Date(string) does', () => {
      // new Date('2026-09-01') is midnight UTC, which is Aug 31 in any negative offset.
      expect(parseDateLocal('2026-09-01').getDate()).toBe(1);
    });
  });

  describe('formatDueDate', () => {
    it('returns TODAY when the date is today', () => {
      expect(formatDueDate('2026-06-15')).toBe('TODAY');
    });

    it('returns an uppercased long date otherwise', () => {
      expect(formatDueDate('2026-09-01')).toBe('1 SEPTEMBER, 2026');
    });
  });

  describe('isOverdue', () => {
    it('returns true for a past date', () => {
      expect(isOverdue('2026-06-14')).toBe(true);
    });

    it('returns false for today', () => {
      expect(isOverdue('2026-06-15')).toBe(false);
    });

    it('returns false for a future date', () => {
      expect(isOverdue('2026-06-16')).toBe(false);
    });
  });
});
