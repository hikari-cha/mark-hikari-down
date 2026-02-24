# Test Plan: hikari-6 create-new-button

## Targeted E2E Cases
1. ツールバー左端に「新規」ボタンがあり、次が「開く」であること。
2. ファイルを開いた状態で編集後「新規」を押すと以下へ戻ること。
   - エディタ内容が空文字
   - `ファイル: 未保存`
   - `新規ドキュメント`
   - 編集モード表示
3. ファイル未読込で入力だけした状態でも「新規」で同様に内容が破棄されること。

## Regression
- `npx playwright test`（フル E2E）
- `npm run test`（unit）

## Execution Result (2026-02-24)
- Targeted: `npx playwright test -g "新規ボタンで初期状態へ戻し未保存内容を破棄する"`
  - Red: 失敗（左端ボタンが `開く` のため）
  - Green: 成功（実装後）
- Full E2E: `npx playwright test` => 14 passed
- Unit: `npm run test` => 12 passed
