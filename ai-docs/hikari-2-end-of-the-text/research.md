# Research: hikari-2 end-of-the-text

## Symptoms
- テキストエリア下端行の文字下部が枠にかぶって見えることがある。
- 最下行付近で入力すると、意図しない上下スクロールが発生することがある。

## Hypotheses (before testing)
1. `.pane` の共通 padding だけでは textarea の最下行表示余白が不足し、descender が視覚的に切れやすい。
2. 下端余白不足により caret 可視化スクロールが頻繁に発生し、最下行入力時の揺れに見える。
3. textarea の line-height が 1.8 で比較的大きく、下端余白不足の影響が目立っている。

## Findings
- `src/App.css` の `.pane` は `padding: 20px`、`.editor-pane` は `line-height: 1.8`。
- editor 専用の下端余白や scroll-padding-bottom は未設定。
- スクロール位置同期ロジック (`onPaneScroll`) はモード切替向けのアンカー更新のみで、入力中スクロールを直接制御していない。

## Root cause
- textarea 下端の可視余白が不足し、最下行の視認性が低下。
- caret 可視化の自動スクロールに余裕がないため、下端行編集中にスクロール揺れが発生しやすい。

## Additional finding (2026-02-18)
- 症状再報告より「最下段で改行を挿入して入力した直後」に文字が潜るケースが残存。
- `.editor-pane` の `line-height: 1.8` は 16px 基準で 28.8px となり、小数行高になる。
- textarea の `scrollTop` はブラウザ実装上整数丸めの影響を受けるため、小数行高と組み合わさると最下段で 1px 前後の欠けが発生しうる。

## Updated root cause
- 下端余白不足に加えて、小数行高とスクロール丸め誤差が重なると、最下段入力時に descender が枠下に潜るケースがある。
