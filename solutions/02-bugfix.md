# ミッション02 解答: 集計バグ

## 原因

`src/services/summaryService.ts` の `buildMonthlySummary` 内、合計のループが**加算ではなく代入**になっている。

```ts
for (const record of closed) {
  total = calcWorkedMinutes(record);   // ← バグ: 毎回上書きされ、最後の1件しか残らない
}
```

テストの `received 435` は2日目(9:00-17:00 → 実働435分)の値、つまり「最終日の実働時間」だけが返っていた。

## 修正

```ts
for (const record of closed) {
  total += calcWorkedMinutes(record);
}
```

## 検証

```bash
git diff        # 変更が summaryService.ts の1行だけであること
npm test        # 10件全件パス
```

## レビュー観点の答え合わせ

- 変更は最小限か → `+=` への1文字変更のみが理想。ついでのリファクタリングが混ざっていたら「今回は最小限に」と指示し直す
- Claude が `total` の初期化位置の変更や `reduce` への書き換えを提案してくることもある。動作が同じなら誤りではないが、**diff が大きいほどレビューコストが上がる**ことは意識する
