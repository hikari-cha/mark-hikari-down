# Research: Unsaved Warning on New/Open

## Root Cause Analysis

- Current `新規` (`handleCreateNew`) always resets editor state immediately, regardless of unsaved changes.
- Current `開く` (`handleImport`) always opens file dialog and replaces editor content immediately when a file is selected.
- There is no concept of "saved baseline" state, so the app cannot detect whether current content differs from the last saved/imported/new baseline.
- As a result, user edits can be lost without confirmation.

## Hypotheses Before Testing

1. A dedicated `savedMarkdown` baseline (or equivalent) can reliably determine unsaved state by comparing with current `markdown`.
2. Intercepting `新規` and `開く` actions and routing through a confirmation dialog only when unsaved changes exist will prevent unintended data loss.
3. If the user selects `保存`, executing normal save flow first and continuing the pending action only on successful save/cancel-not-triggered will match expected UX.
4. If the user selects `破棄`, immediately executing the pending action (new/open) will preserve existing behavior.
5. If an opened file has no edits, no warning should appear because `markdown === saved baseline`.
