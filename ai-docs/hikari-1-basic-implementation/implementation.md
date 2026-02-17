# 実装要点（Hikari-1 Basic）

## 1. アプリ概要
- 本アプリは **Tauri + React + TypeScript** で構成されたデスクトップ向け Markdown エディタです。
- 編集ペインとプレビューペインを単一画面で切り替え、Markdown の読み込み・保存・名前を付けて保存に対応しています。

## 2. 構成
- フロントエンド: `src/App.tsx`, `src/markdown.ts`, `src/fileIO.ts`
- スタイリング: `src/App.css`
- デスクトップ基盤: `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json`

## 3. 主要機能の実装
### 3.1 編集/プレビュー切り替え
- `mode` (`"edit" | "preview"`) で表示ペインを制御。
- `pendingAnchorLineRef` に表示中ペインの先頭行を記録し、モード切替後に同じ行付近へ復元。
- 編集モード復帰時は `editorSelectionRef` でカーソル/選択範囲を復元し、編集ペインへフォーカスを戻す。

### 3.2 Markdown レンダリング
- `renderMarkdownToSafeHtml`（`src/markdown.ts`）で `unified` パイプラインを構築。
- 使用プラグイン: `remark-parse`, `remark-gfm`, `remark-breaks`, `remark-math`, `remark-rehype`, `rehype-raw`, `rehype-katex`, `rehype-stringify`。
- `rehypeSourceLineAttribute` により各要素へ `data-source-line` を付与し、スクロール位置同期に利用。

### 3.3 ファイル入出力
- `@tauri-apps/plugin-dialog` の `open/save` でダイアログを表示。
- `@tauri-apps/plugin-fs` の `readTextFile/writeTextFile` で `.md/.markdown` を読み書き。
- 上書き保存時は既存パス、未保存時は Save As フローへ自動遷移。

### 3.4 保存フィードバック
- ステータスメッセージをフッター表示。
- 上書き保存時は保存ボタンに一時的なパルスアニメーション。
- 「保存しました」バッジを短時間表示。

## 4. セキュリティと安全性
- `DOMPurify` を適用し、レンダリング HTML をサニタイズ。
- `DOM_PURIFY_CONFIG` で `script/style/iframe/object/embed` を禁止し、危険プロトコルも抑止。
- Tauri 側 `tauri.conf.json` で CSP を定義し、スクリプト実行元を制限。

## 5. Tauri 側実装
- `src-tauri/src/lib.rs` で `tauri_plugin_dialog` と `tauri_plugin_fs` を登録。
- Rust 側に独自コマンドは未実装で、現時点はプラグイン経由の I/O 提供が中心。

## 6. 現状の制約
- 1ファイル編集前提（複数タブやセッション管理なし）。
- 自動保存/復元、差分表示、エクスポート（PDF/HTML）などは未対応。
- UI E2E テストは未整備（ユニットテスト中心）。
