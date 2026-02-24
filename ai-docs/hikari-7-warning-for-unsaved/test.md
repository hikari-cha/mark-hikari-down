# Test Plan

## E2E (Playwright)

1. `新規` with unsaved edits opens warning dialog.
2. In warning dialog, selecting `保存`:
   - Runs normal save flow.
   - Then continues pending action (new/open).
3. In warning dialog, selecting `破棄`:
   - Skips save flow.
   - Immediately continues pending action.
4. When a file is open but unchanged, `新規`/`開く` should not show warning.

## Unit

1. Unsaved detection logic returns:
   - `false` when current content equals baseline.
   - `true` when current content differs from baseline.

## Regression

1. Run `npm test`.
2. Run `npx playwright test` (full suite, no filter).

## Results

- Targeted E2E (unsaved warning scenarios): once Red confirmed, then Green (5/5 passed).
- Unit (`npm test`): 3 files, 14 tests all passed.
- Full E2E (`npx playwright test`): 18/18 passed.
