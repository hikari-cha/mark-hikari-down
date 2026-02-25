# Test Plan: Ctrl+Eで編集/プレビュー切り替え

## E2E（Playwright）
- 編集モード表示時に `Ctrl+E` でプレビューモードへ切り替わること。
- プレビューモード表示時に `Ctrl+E` で編集モードへ切り替わること。

## Unit Test
- 既存のキーバインド/モード切替ロジックに対して必要な単体テストを追加または更新する。

## 回帰
- `npx playwright test` をフル実行して既存機能が壊れていないこと。

## 実行結果（2026-02-25）
- Red確認: `npx playwright test -g "Ctrl\\+E"` は実装前に失敗（`編集モードへ` ボタンが表示されない）。
- Green確認: `npx playwright test -g "Ctrl\\+E"` は実装後に成功（1 passed）。
- Unit: `npm test` は成功（3 files, 14 tests passed）。
- E2E回帰: `npx playwright test` は成功（20 passed）。
