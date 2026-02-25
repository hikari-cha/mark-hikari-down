# Test Plan

## Targeted Regression Test (Playwright)

- Insert a line break in the middle of a long document where scrollbar is visible.
- Verify scroll position does not jump to document bottom.

## Existing Behavior Safety Checks

- Existing end-of-document line-break behavior remains stable.
- Existing typing-at-bottom behavior (without line break) remains stable.

## Mandatory Verification

- Run targeted Playwright test first (must fail before fix, then pass after fix).
- Run unit tests.
- Run full Playwright suite (`npx playwright test`).

## Execution Results

- `npx playwright test -g "スクロール可能な文書の途中で改行しても最下部へジャンプしない"`:
  - Before fix: Failed (Red), `drift` was far above expected range.
  - After fix: Passed (Green).
- `npm test`: Passed (3 test files, 14 tests).
- `npx playwright test`: Passed (19 tests).