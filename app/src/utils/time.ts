/**
 * "HH:MM" 形式の時刻を 0:00 からの経過分に変換する。
 */
export function toMinutes(time: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) {
    throw new Error(`invalid time format: ${time}`);
  }
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * 分を "H時間M分" 形式にフォーマットする。
 */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}時間${m}分`;
}

/**
 * 拘束時間（分）に応じた休憩控除時間（分）を返す。
 * 仕様: 6時間を超える場合45分、8時間を超える場合60分を控除する。
 */
export function calcBreakMinutes(grossMinutes: number): number {
  if (grossMinutes > 480) {
    return 60;
  }
  if (grossMinutes >= 360) {
    return 45;
  }
  return 0;
}
