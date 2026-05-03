# Test Plan: Open File from Windows Explorer (Issue #12)

## E2E Tests

### 起動時にファイルパスが渡された場合、自動的にファイルを読み込む
- Mock: `initialFilePath` = `/mock/path/to/startup_file.md`
- Expected: editor contains file content on first load
- Expected: status bar shows correct file path
- Expected: status message shows "読み込み完了: ..."
- Expected: `get_initial_file_path` was invoked
- Expected: `plugin:fs|read_text_file` was invoked

### 起動時にファイルパスが渡されない場合、初期状態のまま
- Mock: no `initialFilePath`
- Expected: editor is empty, "新規ドキュメント" shown

## Unit Tests (fileIO.ts)

### readMarkdownFileByPath
- Returns `{ path, content }` for given path
- Calls `readText` with the given path

## Manual Verification (after build/install)
1. Build and install the app via installer
2. Right-click a `.md` file in Explorer → "プログラムから開く" → MarkHikariDown
3. Verify the file content is displayed in the editor
