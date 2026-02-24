# Research: Ctrl+S Save Shortcut

## Scope
- Add keyboard shortcut support so existing save behavior can be triggered with `Ctrl+S`.
- Reuse existing "上書き保存" and "名前を付けて保存" flows without changing file I/O APIs.

## Current Behavior
- `handleSave` in `src/App.tsx`:
  - If `currentFilePath` is `null`, calls `saveMarkdownFileAs(markdown, null)`.
  - Otherwise writes directly with `saveMarkdownFile(currentFilePath, markdown)`.
- `handleSaveAs` triggers `saveMarkdownFileAs(markdown, currentFilePath)`.
- Save actions are currently button-only (`上書き保存`, `名前を付けて保存`).

## Hypotheses (Before Validation)
1. A global `keydown` listener for `Ctrl+S` can trigger `handleSave` and preserve current behavior.
2. The browser default save action must be suppressed with `event.preventDefault()`.
3. Existing E2E mocks can verify shortcut-triggered save by checking status text and mocked Tauri command calls.

## Root Cause
- No keyboard shortcut handler is registered in the app; save actions are exposed only via toolbar buttons.

## Validation
- Hypothesis 1: confirmed. Global keydown hook can call existing `handleSave` without changing save APIs.
- Hypothesis 2: confirmed. `preventDefault()` is required to avoid browser default save behavior.
- Hypothesis 3: confirmed. Existing Tauri mock call logs were sufficient to verify Save As vs overwrite behavior.
