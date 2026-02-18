# Test Plan: hikari-2 end-of-the-text

## Manual checks
1. 長文入力で最下行までスクロールし、文字下部が枠に隠れないこと。
2. 最下行で連続入力しても、不要な上下揺れが発生しないこと。
3. 編集/プレビュー切替後もスクロール同期と選択範囲復元が壊れていないこと。

## Automated checks
1. 既存 E2E 一式を実行し回帰がないこと。
2. 最下行編集中のスクロール挙動に関する新規 E2E が通過すること。

## Result
- `npx playwright test`: 9 passed
- 新規テスト `最下行編集中に下端の可視余白を維持する` が通過
- `npx playwright test` (re-run after追加修正): 10 passed
- 新規テスト `最下段で改行挿入後に入力しても末尾行が潜らない` が通過
