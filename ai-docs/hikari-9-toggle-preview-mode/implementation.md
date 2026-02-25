# Implementation Plan: Ctrl+Eで編集/プレビュー切り替え

## 実装計画
1. 既存ショートカット処理とモード状態管理箇所を調査する。
2. UI仕様を固定するPlaywrightテストを先に追加する。
3. 追加テストのみ実行し、失敗（Red）を確認する。
4. `Ctrl+E` でモード切り替えする実装を追加する。
5. 追加テストを再実行して成功（Green）を確認する。
6. 単体テストとPlaywright全件回帰を実行する。
7. 結果を `test.md` に記録する。

## 作業ログ
- 2026-02-25: 計画作成。
- 2026-02-25: Playwrightに `Ctrl+E` テストを先行追加。
- 2026-02-25: `npx playwright test -g "Ctrl\\+E"` を実行し、未実装のため失敗（Red）を確認。
- 2026-02-25: `src/App.tsx` のグローバルキーバインドに `Ctrl/Cmd+E` を追加し、既存 `toggleMode` を呼び出す実装を追加。
- 2026-02-25: `npx playwright test -g "Ctrl\\+E"` を再実行して成功（Green）を確認。
- 2026-02-25: `npm test`（Vitest 14件）成功。
- 2026-02-25: `npx playwright test`（Playwright 20件）成功。
