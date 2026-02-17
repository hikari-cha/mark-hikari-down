# テスト状況（Hikari-1 Basic）

## 1. テスト実行結果
- 実行日時: 2026-02-18 00:45:02 +09:00
- 実行コマンド: `npm test`
- 結果サマリ:
  - Test Files: 2 passed
  - Tests: 12 passed
  - 失敗: 0

## 2. 実装済みテスト
### 2.1 `src/markdown.test.ts`（7件）
- 見出し・段落のレンダリング
- 斜体のレンダリング
- 改行（`remark-breaks`）反映
- 空行連続時の段落分離
- リスト変換
- KaTeX レンダリング
- XSS 文字列（`onerror`, `script`, `javascript:`）のサニタイズ

### 2.2 `src/fileIO.test.ts`（5件）
- ファイル選択キャンセル時の `null` 返却
- 選択ファイル読み込み時の内容取得
- 上書き保存時の書き込み呼び出し
- Save As キャンセル時の `null` 返却
- Save As 成功時の書き込みと保存先パス返却

## 3. テスト方針の特徴
- `fileIO` は依存注入（`FileIODeps`）で Tauri API をモックしやすい設計。
- Markdown 変換は出力 HTML 断片を正規表現/部分一致で検証し、描画仕様を固定化。
- 実行環境は `vite.config.ts` の `vitest` 設定で `jsdom` + `globals: true`。

## 4. 未カバー/今後の拡張候補
- `App.tsx` の UI イベント（モード切替、スクロール位置維持、保存通知表示）のコンポーネントテスト。
- Tauri 実行時の実ファイル I/O を含む統合テスト。
- 例外系（権限エラー、ファイル破損、巨大ファイル）や回帰テストの追加。
