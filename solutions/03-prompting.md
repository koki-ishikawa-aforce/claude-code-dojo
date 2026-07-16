# ミッション03 解答: 境界値バグ・APIバグ

## 境界値バグ（本編）

### 原因

`src/utils/time.ts` の `calcBreakMinutes`。仕様は「6時間を**超える**場合45分控除」（SPEC.md）だが、実装は「6時間**以上**」になっている。

```ts
if (grossMinutes >= 360) {   // ← バグ: 仕様は「超える」なので > が正しい
  return 45;
}
```

拘束ちょうど6時間（360分）のとき、仕様では休憩なしなのに実装は45分控除する。既存テストは300分と420分しか検証しておらず、両方とも境界を踏まないため通ってしまう。

### 修正と追加テスト

```ts
if (grossMinutes > 360) {
  return 45;
}
```

```ts
it('拘束ちょうど6時間は休憩なし（仕様: 超える場合のみ控除）', () => {
  expect(calcBreakMinutes(360)).toBe(0);
});

it('拘束ちょうど8時間は45分控除（60分になるのは超えた場合）', () => {
  expect(calcBreakMinutes(480)).toBe(45);
});
```

> `> 480` の方は元から仕様どおり。Claude が「こちらも `>=` では」と誤修正してきたら、SPEC.md を根拠に押し返せるか——受け手のレビュー力も試されるポイント。

## APIバグ（発展課題）

### 現象

- `GET /api/summary/2026-07` が 500（スタックトレース付き）
- `GET /api/summary/abc` が 400 ではなく 200 で空サマリーを返す

### 原因（2つの複合）

1. `buildMonthlySummary` が**未退勤（clockOut が null）レコードを除外していない**。SPEC.md は「未退勤のレコードは集計から除外する」。変数名が `closed` なのに退勤済みフィルタがないのがヒント
2. `src/routes/attendance.ts` の summary ルートに **month 形式のバリデーションがない**。SPEC.md は「YYYY-MM 形式でない場合は 400」

### 修正例

```ts
// summaryService.ts
const closed = records.filter((r) => r.date.startsWith(month) && r.clockOut !== null);
```

```ts
// routes/attendance.ts
router.get('/summary/:month', (req, res) => {
  const month = req.params.month;
  if (!/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ error: 'month must be YYYY-MM' });
    return;
  }
  const records = listAttendance(db, month);
  res.json(buildMonthlySummary(month, records));
});
```

### 検証

```bash
npm run seed
PORT=3210 npm run dev &
curl http://localhost:3210/api/summary/2026-07   # 200でサマリーJSON（勤務日数7、打刻忘れ1件は除外）
curl -i http://localhost:3210/api/summary/abc    # 400
```

未退勤除外のユニットテストも追加できれば完璧。
