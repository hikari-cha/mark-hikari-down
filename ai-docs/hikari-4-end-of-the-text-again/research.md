# Research: Bottom Edge Input Jitter (Hikari-4)

## Task Summary
- エディタ下端で文字入力した際のガタつき問題を対象にする。
- 今回は実装前の準備として、原因仮説と設計方針を整理する。

## Hypotheses (Before Validation)
1. `onChange` ごとに下端へ再スナップする処理が動き、改行しない文字入力でも `scrollTop` が揺れている。
2. `line-height` が計算値や端数を含む場合、下端判定 (`bottomGap <= lineHeight * X`) が境界で不安定化する。
3. コンテナの overscroll 伝播が有効だと、下端付近入力時の体感揺れを助長する。

## Current State (Observed from code)
- `src/App.tsx` では `onChange` 内で `stabilizeEditorBottomLine` を即時 + `requestAnimationFrame` の2回実行している。
- `src/App.css` の `.editor-pane` は `line-height: 28px` と `overscroll-behavior: contain` が設定済み。
- 既存 E2E は「最下段の可視余白維持」「改行後に末尾行が潜らない」までを担保しているが、
  「改行なし入力中に `scrollTop` が不変」の直接保証はない。

## Root Cause Candidate
- 改行不要の通常入力でも下端吸着ロジックが毎回発火することで、
  本来不要な `scrollTop` 再設定が発生し、ガタつきが起こる可能性が高い。

## Validated Root Cause (2026-02-24)
- `textarea` の `onScroll` で更新した `pendingAnchorLineRef` が、`markdown` 更新ごとの
  `useEffect([mode, renderedHtml])` で都度再適用されていた。
- 再適用は `restoreEditorToLine` 経由で行ベース (`Math.floor(scrollTop / lineHeight)`) のため、
  編集中の実 `scrollTop` が量子化され、`5666 -> 5656` のように低下する。
- その結果、「最下段で改行なし入力中は scrollTop を固定する」テストで不一致が発生した。
