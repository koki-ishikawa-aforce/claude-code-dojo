# ミッション06: hooks で自動化する

## ゴール

- PostToolUse hook で「ファイル編集のたびに自動 lint」を仕込む
- PreToolUse hook で危険コマンドをブロックするガードを作る
- 「AIに任せる部分」と「機械的に強制する部分」の使い分けを理解する

## 背景解説

### hooks とは

Claude Code の動作の特定タイミングで**自動実行されるシェルコマンド**です。CLAUDE.md のルールとの決定的な違いはここです:

- CLAUDE.md: 「lintしてね」→ Claude が**従う**（たまに忘れる）
- hooks: 編集イベントで lint が**必ず走る**（忘れようがない）

**AIへのお願いは確率的、hooks は決定的**。守らせたいことが「絶対」なら hooks にします。

### 主なイベント

| イベント | タイミング | 用途例 |
|---|---|---|
| PreToolUse | ツール実行**前**（ブロック可能） | 危険コマンドの拒否 |
| PostToolUse | ツール実行**後** | 編集後の自動lint・フォーマット |
| Stop | Claudeの応答完了時 | 作業ログ記録、通知 |

設定は `.claude/settings.json`（プロジェクト・チーム共有）または `~/.claude/settings.json`（個人）に書きます。

## ミッション手順

### 1. 編集後の自動 lint（PostToolUse）

`app/.claude/settings.json` を作成:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path'); case \"$FILE\" in *.ts) cd \"$CLAUDE_PROJECT_DIR\" && npx eslint --no-warn-ignored \"$FILE\" 2>&1 | head -20;; esac; true"
          }
        ]
      }
    ]
  }
}
```

> hook の入力は stdin に JSON で渡されます。`jq` で編集されたファイルパスを取り出し、`.ts` ファイルのときだけ lint しています。末尾の `true` は「エラーを報告してもブロックはしない」ためのお約束です。

### 2. 動作確認

`claude` を再起動（hooks はセッション開始時に読み込み）し、わざと lint エラーになる依頼をします:

```
src/utils/time.ts に、使わない変数 const unused = 1 を追加して
```

編集直後に hook が発火し、eslint の `no-unused-vars` エラーが Claude 自身に見えるところに出力されます。**Claude がエラーに気づいて自分で直そうとする**挙動を観察してください。これが hooks の真価です——人間がレビューで指摘する前に、機械がAIに指摘してくれる。

確認後、`git checkout src/utils/time.ts` などで元に戻しておきます。

### 3. 危険コマンドのガード（PreToolUse）

`.claude/settings.json` に `PreToolUse` を追記します。**ステップ1の `PostToolUse` を消さないよう**、マージ後の完成形を示します:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' | grep -qE 'rm -rf|DROP TABLE' && echo 'ブロック: 破壊的コマンドはこのプロジェクトでは禁止' >&2 && exit 2 || exit 0"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path'); case \"$FILE\" in *.ts) cd \"$CLAUDE_PROJECT_DIR\" && npx eslint --no-warn-ignored \"$FILE\" 2>&1 | head -20;; esac; true"
          }
        ]
      }
    ]
  }
}
```

> exit code 2 がツール実行の**ブロック**を意味します。stderr のメッセージは Claude に渡り、代替手段を考え始めます。この完成形は [solutions/06-hooks/settings.json](../solutions/06-hooks/settings.json) と同じものです。

再起動して動作確認:

```
data ディレクトリを rm -rf で削除して
```

ブロックされること、Claude が別の方法を提案してくることを確認してください。

> hook より先に **Claude 自身が「DB 本体なので復元できません。本当に削除しますか？」と確認してくる**ことがあります。その場合は「確認済み、実行して」と押し切ってください——今度は hook が実行を止めます。この2段階こそが本ミッションの核心です: モデルの自制は**確率的**（聞いてこないこともある）、hook は**決定的**（必ず止まる）。

### 良い頼み方 / 悪い頼み方（自動化の設計）

> ❌ CLAUDE.md に「rm -rf は絶対に実行しないこと！！」と強い言葉で書く
>
> ✅ PreToolUse hook でブロックする（CLAUDE.md には方針として一言だけ）

「絶対」をお願いで実現しようとしない。**お願いは方針に、強制は機構に**。これは人間のチーム運営（ルール掲示 vs システム制約）と同じ発想です。

## チェックポイント

- [ ] 編集後に eslint が自動で走り、Claude がエラーに自分で気づく様子を観察した
- [ ] `rm -rf` がブロックされ、Claude が代替案を出すことを確認した
- [ ] 「CLAUDE.mdに書く」と「hookにする」の判断基準を説明できる

## 発展課題

- PostToolUse で prettier の自動フォーマットも追加する
- Stop hook で「応答完了時に作業内容を1行ログに残す」を作る（日報の材料になる）
- チーム標準の hooks セットを設計する（何を強制すべきか議論の種になる）

## ハマりどころ

| 症状 | 対処 |
|---|---|
| hook が発火しない | settings.json 変更後は要再起動。JSONの構文エラーも疑う（`jq . .claude/settings.json` で検証） |
| hook のエラーで作業が進まない | `|| true` を付けて「報告はするがブロックしない」形にする（PostToolUseの基本形） |
| ガードが厳しすぎて誤爆する | grep のパターンを絞る。ガードは「本当に危険なもの」に限定しないと形骸化する |
| jq: command not found | `sudo apt install jq`（WSL/Ubuntu） |

---

→ 次: [ミッション07: permissions とセキュリティ — AIに渡す鍵を管理する](07-permissions.md)
