# 付録: WSL2 導入ガイド（Windowsユーザー向け）

## このドキュメントについて

- **対象**: Windows を使っていて、WSL をまだ導入していない人
- **ゴール**: WSL2 上の Ubuntu で Node.js v20 が動く状態にして、[ミッション00: 環境構築](00-setup.md) に合流する
- WSL 導入済みの人、macOS / Linux の人はこのドキュメントは不要です。そのまま [ミッション00](00-setup.md) へ進んでください

> **WSL とは**: Windows の中で Linux（このガイドでは Ubuntu）を動かす仕組みです。Claude Code や Node.js 系のツールは Linux 環境での情報が最も充実しており、この Dojo も WSL2（Ubuntu）を前提に書かれています。

## 1. WSL2 と Ubuntu のインストール

**PowerShell を管理者として起動**します（スタートメニューで「PowerShell」を右クリック →「管理者として実行」）。

```powershell
wsl --install
```

このコマンド1つで、WSL2 に必要な機能の有効化と Ubuntu のインストールが行われます。完了したら **PC を再起動**してください。

> **Windows 10 の場合**: バージョン 2004（ビルド 19041）以上が必要です。Windows 11 はそのままでOKです。

### すでに WSL が入っていて Ubuntu だけない場合

`wsl --install` を実行してヘルプが表示されるだけのときは、WSL 本体は導入済みです。次を実行してください。

```powershell
wsl --update
wsl --install -d Ubuntu
```

### Ubuntu の初回起動

再起動後、Ubuntu が自動で起動します（起動しない場合はスタートメニューから「Ubuntu」を開く）。初回はセットアップに数分かかり、**Linux 用のユーザー名とパスワード**を聞かれるので作成してください。

- ユーザー名は小文字の英数字で（Windows のユーザー名と同じでなくてOK）
- パスワードは `sudo`（管理者コマンド）実行時に使います。入力中は画面に何も表示されませんが、打てています

インストール状態の確認は PowerShell で:

```powershell
wsl -l -v
```

`Ubuntu` の行の VERSION が **2** になっていればOKです。

## 2. Ubuntu の初期設定

ここからは **Ubuntu のターミナル内**で作業します。まずパッケージを最新化し、この Dojo で使うツールを入れておきます。

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential jq
```

- `build-essential`: 題材アプリの better-sqlite3 がビルドを必要とした場合の保険です
- `jq`: ミッション07（hooks）で使います。今入れておくと後で楽です

## 3. Node.js v20 の導入（nvm 経由）

Node.js は **nvm（Node Version Manager）経由**で入れます。`sudo apt install nodejs` は古いバージョンが入ることがあり、`npm install -g` で権限エラーの原因にもなるので使いません。

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
```

インストール後、**ターミナルを一度閉じて開き直して**から（または `source ~/.bashrc` を実行してから）、Node.js を入れます。

```bash
nvm install 20
node -v    # v20.x.x 以上が表示されればOK
```

## 4. git の設定

git は Ubuntu に最初から入っています。コミットに使う名前とメールアドレスだけ設定しておきます。

```bash
git config --global user.name "あなたの名前"
git config --global user.email "you@example.com"
```

## 5. 作業場所の注意

リポジトリは **Linux 側のホームディレクトリ（`~/` 配下）に置いてください**。Windows 側（`/mnt/c/...` 配下）に置くとファイルアクセスが極端に遅く、ツールの誤動作の原因にもなります。

```bash
cd ~    # ここで git clone する（クローン手順はミッション00にあります）
```

## チェックポイント

- [ ] PowerShell で `wsl -l -v` を実行し、Ubuntu の VERSION が **2** になっている
- [ ] Ubuntu 内で `node -v` が **v20 以上**を表示する
- [ ] Ubuntu 内で `git config --global -l` に user.name と user.email が表示される

## ハマりどころ

| 症状 | 対処 |
|---|---|
| `wsl --install` がエラー 0x80370102 で失敗 | PC の BIOS/UEFI で仮想化支援機能（Intel VT-x / AMD-V）が無効。有効化して再試行 |
| 再起動後に Ubuntu が起動しない | スタートメニューから「Ubuntu」を手動で起動する |
| インストールが 0.0% で止まる | `wsl --install --web-download -d Ubuntu` で再試行 |
| `nvm: command not found` | ターミナルを開き直す（または `source ~/.bashrc`） |
| `node -v` が古いバージョンを表示する | Windows 側の Node.js を見ている可能性。**Ubuntu のターミナル内**で確認する。Ubuntu 内で古い場合は `nvm use 20` |
| VERSION が 1 になっている | PowerShell で `wsl --set-version Ubuntu 2` を実行 |

---

→ 続き: [ミッション00: 環境構築](00-setup.md) の「3. リポジトリの取得と題材アプリのセットアップ」へ（手順1〜2のインストール・ログインも Ubuntu 内で行います）
