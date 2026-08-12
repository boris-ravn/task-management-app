import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logError, getLoggedErrors, clearLoggedErrors } from './error-logger';

describe('error-logger', () => {
  beforeEach(() => {
    clearLoggedErrors();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('starts with no entries', () => {
    expect(getLoggedErrors()).toEqual([]);
  });

  it('records the message and context of an Error', () => {
    logError(new Error('Network error'), { action: 'deleteTask', taskId: '42' });

    const [entry] = getLoggedErrors();
    expect(entry.message).toBe('Network error');
    expect(entry.context).toEqual({ action: 'deleteTask', taskId: '42' });
    expect(entry.stack).toBeDefined();
  });

  it('stringifies a non-Error value and leaves the stack undefined', () => {
    logError('something broke', { action: 'createTask' });

    const [entry] = getLoggedErrors();
    expect(entry.message).toBe('something broke');
    expect(entry.stack).toBeUndefined();
  });

  it('accumulates entries in call order', () => {
    logError(new Error('first'), { action: 'createTask' });
    logError(new Error('second'), { action: 'updateTask' });

    expect(getLoggedErrors().map((entry) => entry.message)).toEqual(['first', 'second']);
  });

  it('clearLoggedErrors empties the sink', () => {
    logError(new Error('first'), { action: 'createTask' });
    clearLoggedErrors();

    expect(getLoggedErrors()).toEqual([]);
  });
});
