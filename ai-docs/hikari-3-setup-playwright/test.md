# Test Plan & Verification

## Coverage Targets
1. Initial UI state in edit mode.
2. Edit/preview mode toggle behavior.
3. Markdown rendering and sanitization in preview.
4. File open flow (dialog + read + UI updates).
5. Save flow for unsaved document (Save As path).
6. Overwrite save flow for existing file path.
7. Save As behavior with current path as default.
8. Cursor selection and focus restoration after mode round-trip.

## Test Cases Implemented
- File: `e2e/app.spec.ts`
- Test count: 8

## Execution
- Command: `npx playwright test`
- Result: all tests passed.

## Pass Criteria
- No failing Playwright tests.
- Assertions validate both UI outcome and Tauri mock call effects.

## Regression Risk Notes
- If `App.tsx` button labels or footer text changes, selector updates may be required.
- If Tauri plugin invocation contract changes, `e2e/mocks/tauri.ts` must be adjusted.
