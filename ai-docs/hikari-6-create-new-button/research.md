# Research: hikari-6 create-new-button

## Root Cause Analysis
- 現在のツールバーは `開く / 上書き保存 / 名前を付けて保存` のみで、アプリ状態を初期状態へ戻す明示操作が存在しない。
- そのため、編集中テキストや現在のファイルパスを破棄して新規作成状態へ戻るユースケースを満たせない。

## Hypotheses
1. `App.tsx` に新規状態へ戻すハンドラを追加し、`markdown`・`currentFilePath`・`statusMessage` を初期値へ戻せば要件を満たせる。
2. 初期状態は編集モードなので、`mode` も `edit` に戻す必要がある。
3. 既存の保存フィードバック表示中に新規遷移した場合の見え残りを防ぐため、`savePulseVisible` と `saveNoticeVisible` もクリアした方が自然。
