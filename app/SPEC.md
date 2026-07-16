# 勤怠集計アプリ 仕様書

## 概要

社員の出退勤を記録し、月次の勤務時間を集計するアプリケーション。
CLI と REST API の2つのインターフェースを持つ。

## 用語

| 用語 | 定義 |
|---|---|
| 拘束時間 | 出勤時刻から退勤時刻までの時間 |
| 休憩時間 | 拘束時間に応じて自動控除される時間（下記ルール参照） |
| 実働時間 | 拘束時間 − 休憩時間 |

## 休憩時間の自動控除ルール

拘束時間に応じて、以下のとおり休憩時間を自動控除する。

- 拘束時間が **6時間を超える** 場合: 45分を控除する
- 拘束時間が **8時間を超える** 場合: 60分を控除する
- それ以外（6時間以下）: 控除しない

**注意: 「超える」であり「以上」ではない。** 拘束時間がちょうど6時間（360分）の場合、休憩は控除しない。ちょうど8時間（480分）の場合、控除は45分である。

## 勤怠記録

1レコードは以下を持つ。

| フィールド | 型 | 説明 |
|---|---|---|
| id | number | 自動採番 |
| date | string | 勤務日（YYYY-MM-DD） |
| clockIn | string | 出勤時刻（HH:MM、24時間表記） |
| clockOut | string \| null | 退勤時刻（HH:MM）。未退勤の場合は null |
| note | string | 備考（任意） |

- 日をまたぐ勤務は対象外（clockOut は clockIn より後の同日時刻）

## 月次サマリー

指定した月（YYYY-MM）について、以下を返す。

| フィールド | 説明 |
|---|---|
| month | 対象月（YYYY-MM） |
| workDays | 勤務日数（退勤済みレコードの件数） |
| totalWorkedMinutes | 実働時間の合計（分） |
| averageWorkedMinutes | 1日あたり平均実働時間（分、小数切り捨て）。勤務日数0の場合は0 |

- **未退勤（clockOut が null）のレコードは集計から除外する**

## REST API

| メソッド | パス | 説明 |
|---|---|---|
| GET | /api/attendance?month=YYYY-MM | 指定月の勤怠一覧 |
| POST | /api/attendance | 勤怠記録の登録 |
| GET | /api/summary/:month | 月次サマリー |

- month パラメータが YYYY-MM 形式でない場合は **400 Bad Request** を返すこと
- 存在しない月を指定した場合はゼロ件として正常応答する

## CLI

```
npm run cli -- add <date> <clockIn> <clockOut> [note]   # 勤怠を登録
npm run cli -- list <YYYY-MM>                            # 指定月の勤怠一覧
npm run cli -- summary <YYYY-MM>                         # 月次サマリー
```
