# Test Plan: Ctrl+S Save Shortcut

## E2E (Playwright)
1. `Ctrl+S` on an unsaved document should execute Save As flow.
2. `Ctrl+S` on an opened/saved document should overwrite current path without save dialog.

## Unit
1. Run existing unit tests to ensure no regressions in file I/O and markdown logic.

## Expected Validation
- Save-related status messages update correctly.
- Mocked Tauri calls show expected `plugin:dialog|save` / `plugin:fs|write_text_file` patterns.

## Execution Result (2026-02-24)
- `npx playwright test e2e/app.spec.ts -g "Ctrl\\+S"` (before implementation): 2 failed
  - `Ctrl+S: 未保存ドキュメントは Save As フローになる`
  - `Ctrl+S: 既存ファイルは上書き保存する`
- `npx playwright test e2e/app.spec.ts -g "Ctrl\\+S"` (after implementation): 2 passed
- `npm run test`: 2 files passed / 12 tests passed
