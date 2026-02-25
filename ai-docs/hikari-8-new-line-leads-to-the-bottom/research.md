# Research: Mid-document line break scrolls to bottom

## Root Cause Analysis

- The editor `onChange` handler calls `stabilizeEditorBottomLine()` whenever `lineBreakInput` is true.
- This call is unconditional and does not check caret position or whether the user is actually editing near the bottom.
- As a result, inserting a line break in the middle of a long document forces `scrollTop` to the max value, making the scrollbar jump to the bottom.
- This behavior aligns with the h7-era bottom-anchor fix and is a likely regression introduced while stabilizing bottom-line editing.

## Hypotheses Before Testing

1. A Playwright test that inserts a line break in the middle of a long document should fail on current code by showing `scrollTop` jump close to max.
2. Restricting bottom stabilization to the bottom-anchor case (`caretAtEnd && nearBottom && lineBreakInput`) will preserve expected behavior at the document end.
3. Mid-document line breaks should keep scroll position approximately stable (allowing at most around one line-height drift).
4. Existing bottom-editing tests should keep passing after narrowing the condition.