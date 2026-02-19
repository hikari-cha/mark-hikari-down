# Test Plan & Result

## Added Playwright Coverage
- File: `e2e/app.spec.ts`
- New case: `最下段で改行なし入力中は scrollTop を固定する`
- Purpose: 下端で `insertText` のみを連続入力した際、`scrollTop` が変化しないことを保証する。

## Test Scenario
1. 多行テキストを投入してエディタを十分にスクロール可能な状態にする。
2. キャレットを末尾に移動し、`scrollTop` を下端へ合わせる。
3. 改行を含まない文字列を1文字ずつ入力する。
4. 各入力後に `scrollTop` が初期値と一致することを検証する。
5. 最後にフォーカス維持と末尾キャレットを検証する。

## Execution Result (2026-02-24)
- `npm run test`
  - Result: 2 files, 12 tests passed.
- `npx playwright test`
  - Result: 11 tests passed.

## Outcome
- 新規 E2E を含めた全テストが green。
- 改行なし入力中の `scrollTop` 低下（`5666 -> 5656`）は再現しないことを確認。
