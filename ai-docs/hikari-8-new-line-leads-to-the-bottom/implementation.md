# Implementation Plan & Work Log

## Plan

1. Create issue docs directory/files for hikari-8.
2. Add a Playwright test first for the regression: line break in the middle of long content must not jump scrollbar to bottom.
3. Run only the targeted Playwright test and confirm failure (Red).
4. Update editor scroll logic so line-break bottom stabilization runs only in bottom-anchor context.
5. Re-run targeted test until pass (Green).
6. Run unit tests.
7. Run full Playwright suite (`npx playwright test`).
8. Update this log and `test.md` with results.

## Work Log

- [x] Planned steps and documented hypotheses.
- [x] Added Playwright regression test (test-first).
- [x] Confirmed targeted test Red (`drift` exceeded threshold before fix).
- [x] Implemented scroll condition fix in `src/App.tsx`.
- [x] Confirmed targeted test Green.
- [x] Ran unit tests (`npm test`: 3 files, 14 tests passed).
- [x] Ran full Playwright regression (`npx playwright test`: 19 tests passed).