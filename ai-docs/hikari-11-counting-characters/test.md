# Test Cases: Character Count (hikari-11)

## E2E Tests (Playwright)

### TC1: Initial state shows 0文字
- Load app
- Status bar should show `0文字`

### TC2: Count updates on typing
- Type `こんにちは` (5 chars)
- Status bar should show `5文字`

### TC3: ASCII characters counted correctly
- Type `Hello` (5 chars)
- Status bar should show `5文字`

### TC4: Comma formatting for 1000+ chars
- Fill editor with 1000+ characters
- Display should use comma formatting, e.g. `1,000文字`

### TC5: Count clears on new document
- Type content, then click 新規
- Count should return to `0文字`

### TC6: Count updates after file open
- Open mock file (content: "# Hello from Mock File\n\nこれはテスト用の偽ファイルです。")
- Count should reflect the character length of that content

### TC7: Position is rightmost
- Verify `char-count` span is visible in the status bar footer

## Regression
- All existing E2E tests must continue to pass
