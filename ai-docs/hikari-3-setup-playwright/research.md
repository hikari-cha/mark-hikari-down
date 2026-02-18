# Research: Playwright E2E Coverage for Hikari-1 Basic

## Task Summary
- Add comprehensive Playwright E2E tests for current behavior.
- Base the test scope on `ai-docs/hikari-1-basic-implementation`.

## Hypotheses (Before Validation)
1. There are no meaningful app E2E tests yet, only Playwright sample tests.
2. Existing app behavior to preserve includes:
- edit/preview mode switching
- markdown rendering and sanitization
- open/save/save-as flows via Tauri plugins
- status/footer feedback updates
- selection/focus restoration when returning to edit mode
3. Tauri plugin calls in browser E2E need a dedicated mock layer.

## Findings
- `e2e/example.spec.ts` was a default Playwright sample against `playwright.dev`, not app behavior tests.
- `src/App.tsx` confirms all behaviors listed above are implemented and should be covered.
- File operations are invoked through `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs`.
- For Tauri v2 JS APIs, robust E2E mocking should use `window.__TAURI_INTERNALS__.invoke`.

## Root Cause
- Missing E2E coverage came from initial project scaffold state: sample Playwright tests were not replaced with app-specific tests.
- Existing mock (`__TAURI_IPC__`) was not aligned with current Tauri v2 invocation path, limiting reliable E2E validation.
