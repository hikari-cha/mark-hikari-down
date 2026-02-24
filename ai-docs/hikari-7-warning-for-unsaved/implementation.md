# Implementation Plan & Work Log

## Plan

1. Create docs for issue `hikari-7-warning-for-unsaved` (research/implementation/test).
2. Add Playwright tests first for:
   - Unsaved warning on `新規` with `保存` flow.
   - Unsaved warning on `新規` with `破棄` flow.
   - Unsaved warning on `開く` with `保存` flow.
   - No warning when opened file is unchanged.
3. Run only targeted Playwright tests and confirm failure (Red).
4. Implement app logic:
   - Track unsaved state using saved baseline.
   - Add pending action state (`new` / `open`).
   - Add confirmation dialog (`保存` / `破棄`).
   - On `保存`, run existing save flow first; proceed only if save succeeds.
   - On `破棄`, continue action immediately.
5. Add/update unit test(s) for new decision logic.
6. Run targeted Playwright tests (Green).
7. Run full unit tests and full Playwright suite.
8. Update this log and `test.md` with results.

## Work Log

- [x] Planned implementation steps.
- [x] Added Playwright test cases (test-first).
- [x] Confirmed Red on targeted Playwright run.
- [x] Implemented unsaved warning dialog and pending action flow.
- [x] Added/updated unit tests.
- [x] Verified targeted Playwright Green.
- [x] Verified full `npm test`.
- [x] Verified full `npx playwright test`.
