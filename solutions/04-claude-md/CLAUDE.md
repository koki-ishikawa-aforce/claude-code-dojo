# 勤怠集計アプリ

勤怠の記録と月次集計を行う CLI + REST API。**仕様の正は SPEC.md**（実装と食い違ったら仕様が正しい）。

## コマンド

- テスト: `npm test`
- lint: `npm run lint`
- API起動: `PORT=3210 npm run dev`（3000は他アプリと衝突しやすいため）
- サンプルデータ投入: `npm run seed`

## 構成

- `src/services/` — ビジネスロジック（純粋関数中心、テスト対象）
- `src/routes/` — Express ルーター
- `src/utils/time.ts` — 時刻計算・休憩控除ルール

## ルール

- 応答は日本語。結論から簡潔に
- テストコードの describe/it は日本語で書く
- コード変更後は必ず `npm test` と `npm run lint` を実行して結果を報告する
- SPEC.md と食い違う実装を見つけたら、修正前に必ず報告する
- テストの期待値を変更する場合は、変更理由を必ず説明する
