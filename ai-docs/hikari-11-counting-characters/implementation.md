# Implementation Plan: Character Count in Status Bar (hikari-11)

## Goal
Add a real-time character count display to the rightmost position of the status bar.

## Requirements
1. Count characters (not words), suitable for Japanese text
2. Display as `〇〇文字` at the far right of the status bar
3. Real-time update as user types
4. Format numbers with commas every 3 digits (e.g., `1,234文字`)
5. Fix the status bar bottom padding (currently too wide)
6. Bar defaults to single-line height; expands when content wraps to 2+ lines

## Implementation Steps

### 1. App.tsx
- Compute character count: `const charCount = [...markdown].length`
  - Use spread operator for proper Unicode code point counting (handles emoji/surrogate pairs)
- Format: `charCount.toLocaleString('ja-JP')` (adds commas automatically)
- Add `<span className="char-count">{...}文字</span>` as last element inside `<footer className="status-bar">`
- Keep `save-feedback` with `margin-left: auto` — it and `char-count` will both sit on the right side
- `char-count` is the last/rightmost flex item

### 2. App.css
- `.status-bar`:
  - Reduce padding from `8px 12px` → `5px 12px` to trim the excess bottom space
  - Add `align-items: center` for proper vertical centering
- `.char-count`: minimal styling — inherit font, use `white-space: nowrap` to prevent wrapping

## Layout Logic
- `margin-left: auto` on `.save-feedback` pushes it (and `char-count` after it) to the right
- `char-count` as the last flex item sits at the absolute right edge
- `flex-wrap: wrap` on `.status-bar` already handles multi-line expansion automatically

## Status
- [x] E2E test written
- [x] Implementation done
- [x] Tests pass (24/24)
