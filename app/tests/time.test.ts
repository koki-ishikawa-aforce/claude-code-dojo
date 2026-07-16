import { describe, expect, it } from 'vitest';
import { calcBreakMinutes, formatMinutes, toMinutes } from '../src/utils/time.js';

describe('toMinutes', () => {
  it('HH:MM を分に変換する', () => {
    expect(toMinutes('09:15')).toBe(555);
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('不正な形式はエラーになる', () => {
    expect(() => toMinutes('9時15分')).toThrow();
    expect(() => toMinutes('')).toThrow();
  });
});

describe('formatMinutes', () => {
  it('分を H時間M分 形式にする', () => {
    expect(formatMinutes(555)).toBe('9時間15分');
    expect(formatMinutes(60)).toBe('1時間0分');
    expect(formatMinutes(0)).toBe('0時間0分');
  });
});

describe('calcBreakMinutes', () => {
  it('拘束5時間は休憩なし', () => {
    expect(calcBreakMinutes(300)).toBe(0);
  });

  it('拘束7時間は45分控除', () => {
    expect(calcBreakMinutes(420)).toBe(45);
  });

  it('拘束9時間は60分控除', () => {
    expect(calcBreakMinutes(540)).toBe(60);
  });
});
