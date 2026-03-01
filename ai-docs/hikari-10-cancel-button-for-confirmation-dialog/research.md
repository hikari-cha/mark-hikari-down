# Research: Cancel Button for Confirmation Dialog

## Root Cause Analysis

- The confirmation dialog (`confirmVisible`) currently shows two buttons: 「保存」 and 「破棄」.
- There is no way to dismiss the dialog without committing to either action.
- UX expectation: pressing 「キャンセル」 should close the dialog and leave the editor in the exact state it was before the dialog appeared (i.e., `pendingAction` is cleared, `confirmVisible` is false, editor content and status are unchanged).

## Key Observations

- `pendingAction` tracks which action triggered the dialog (`"new"` or `"open"`).
- `confirmVisible` controls dialog visibility.
- A cancel handler simply needs to set both back to their neutral values (`null` / `false`) with no side-effects.
- No file I/O, no state mutation beyond the dialog-related state.
