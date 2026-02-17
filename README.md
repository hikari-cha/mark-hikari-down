# MarkHikariDown

Tauri + React + TypeScript で構築した、Markdown の編集と安全なプレビュー表示に特化したデスクトップアプリです。

## 主な機能
- Markdown テキストの編集
- プレビュー表示（GFM、改行、数式対応）
- ファイルを開く（`.md`, `.markdown`）
- 上書き保存 / 名前を付けて保存
- 編集・プレビュー切り替え時の先頭表示行維持
- 編集→プレビュー→編集の往復時にカーソル位置とフォーカスを維持
- DOMPurify による XSS 対策

## 技術スタック
- フロントエンド: React 19, TypeScript, Vite
- Markdown 処理: unified, remark, rehype, KaTeX
- サニタイズ: DOMPurify
- デスクトップ: Tauri 2（dialog / fs plugin）
- テスト: Vitest, jsdom

## セットアップ
### 前提
- Node.js（LTS 推奨）
- Rust（stable）
- Tauri 2 の開発要件

### インストール
```bash
npm install
```

## 開発
### Web 開発サーバー
```bash
npm run dev
```

### Tauri アプリとして起動
```bash
npm run tauri dev
```

## ビルド
```bash
npm run build
npm run tauri build
```

## テスト
```bash
npm test
```

現時点では以下のテストが実装されています。
- `src/markdown.test.ts`: Markdown 変換とサニタイズ
- `src/fileIO.test.ts`: ファイル I/O ロジック（モック利用）

## ディレクトリ構成
```text
src/
  App.tsx          # 画面ロジック（編集・プレビュー・保存）
  markdown.ts      # Markdown -> 安全な HTML 変換
  fileIO.ts        # ダイアログ/ファイル入出力
  *.test.ts        # ユニットテスト
src-tauri/
  src/lib.rs       # Tauri 起動設定（plugin 登録）
  tauri.conf.json  # アプリ設定・CSP・ビルド設定
ai-docs/
  hikari-1-basic-implementation/
    implementation.md
    test.md
```

## 補足
- セキュリティ上、プレビュー HTML は必ず DOMPurify を通しています。
- 現在は単一ドキュメント編集を前提とした最小構成です。
