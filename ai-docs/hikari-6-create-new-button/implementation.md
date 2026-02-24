# Implementation Plan & Log: hikari-6 create-new-button

## Plan
1. Playwright に「新規」ボタンの仕様テストを先に追加する（位置・状態リセット・未保存破棄）。
2. 追加した targeted test を単体実行し、失敗を確認する（Red）。
3. `App.tsx` に新規ハンドラとボタンを実装し、要件どおり初期状態へ遷移させる。
4. targeted test を再実行して成功を確認する（Green）。
5. 全 Playwright 回帰と unit test (`npm run test`) を実行する。
6. 実施結果を `test.md` に記録する。

## Work Log
- 2026-02-24: ドキュメント初期作成。
- 2026-02-24: Playwright targeted test `新規ボタンで初期状態へ戻し未保存内容を破棄する` を追加し、Red（未実装）を確認。
- 2026-02-24: `App.tsx` に `handleCreateNew` と `新規` ボタンを追加し、初期状態へのリセットを実装。
- 2026-02-24: targeted test を再実行して Green を確認。
- 2026-02-24: `npx playwright test`（14件）と `npm run test`（12件）を実行し、全件成功。
