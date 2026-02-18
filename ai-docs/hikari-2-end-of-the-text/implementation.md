# Implementation: hikari-2 end-of-the-text

## Plan
1. editor の行高を整数pxへ変更し、最下段の小数丸め誤差を抑える。
2. 最下端付近での入力時に `scrollTop` を安定化する補正処理を追加する。
3. 「最下段で改行挿入後に入力しても潜らない」E2Eテストを追加する。
4. Playwright を実行して既存機能に回帰がないことを確認する。

## Work log
- [x] `research.md` 作成、仮説と根本原因を記録。
- [x] `src/App.css` 修正
- [x] `src/App.tsx` 修正
- [x] `e2e/app.spec.ts` に最下行 UX テスト追加
- [x] `npx playwright test` 実行
- [x] `test.md` に結果反映
- [x] 追加調査を `research.md` に追記
- [x] `src/App.css` の行高を整数px化
- [x] `src/App.tsx` に最下端入力時のスクロール補正を追加
- [x] `e2e/app.spec.ts` に改行挿入ケースの再現テストを追加
- [x] `npx playwright test` 再実行
- [x] `test.md` に再実行結果を反映
