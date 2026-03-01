# Test Cases: Cancel Button for Confirmation Dialog

## E2E Tests (Playwright)

### TC-1: 未保存状態で新規を押してキャンセルを選ぶとダイアログが閉じ何も変わらない
- Type text into editor.
- Click 「新規」 → dialog appears.
- Click 「キャンセル」 → dialog closes.
- Editor still shows the typed text.
- Status/file unchanged (still 未保存).
- No file I/O calls (no save, no read).

### TC-2: 未保存状態で開くを押してキャンセルを選ぶとダイアログが閉じ何も変わらない
- Type text into editor.
- Click 「開く」 → dialog appears.
- Click 「キャンセル」 → dialog closes.
- Editor still shows the typed text.
- No file I/O calls.
