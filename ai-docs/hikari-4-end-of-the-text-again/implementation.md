# Implementation Plan & Work Log

## Initial Plan
1. `src/App.tsx` の下端吸着条件を見直し、改行時のみ再スナップを許可する設計にする。
2. `line-height` をピクセル固定前提で扱い、判定ブレを減らす。
3. `overscroll-behavior` の設定を明示して、スクロール連鎖の影響を抑える。
4. Playwright で「改行なし入力中の `scrollTop` 不変」を追加検証する。

## Design Addendum: 改行時以外のスクロール固定ロジック

### Goal
- エディタ最下端での連続文字入力中に `scrollTop` を固定し、視覚的なガタつきを抑止する。
- ただし `Enter` (改行) では末尾行追従を維持する。

### Proposed Behavior
1. 入力種別を判定する。
- `insertLineBreak` / `insertParagraph` の場合のみ「下端追従候補」とする。
- それ以外 (`insertText` など) は「スクロール固定モード」とする。

2. 入力直前の `scrollTop` を保持する。
- 末尾キャレットかつ下端近傍のとき、`previousScrollTop` を退避する。
- 改行以外の入力ではレンダリング後に `scrollTop = previousScrollTop` を適用する。

3. 改行時のみ bottom snap を許可する。
- 既存の `stabilizeEditorBottomLine` / `keepEditorBottomAnchoredRef` を
  「改行入力時」に限定して適用する。

4. CSS 制約を固定する。
- `.editor-pane` の `line-height` はピクセル固定 (例: `28px`) を維持する。
- `.editor-pane` に `overscroll-behavior: contain` を設定して overscroll 連鎖を抑える。

### Acceptance Criteria (Design)
- 改行なし連続入力中、`scrollTop` が開始時点から変化しない。
- `Enter` 後は末尾行が隠れず、下端追従が維持される。
- line-height/overscroll の CSS 条件が固定値として維持される。

## Work Log (2026-02-19)
1. ブランチ命名がフロー規約 (`fix/hikari-4/end-of-the-text-again`) を満たすことを確認。
2. `ai-docs/hikari-4-end-of-the-text-again` を作成し、事前ドキュメントを整備。
3. 本ファイルへ「改行時以外のスクロール固定ロジック」設計を追記。
4. 実装コード (`src/App.tsx` / `src/App.css`) は未変更のまま停止。

## Work Log (2026-02-24)
1. 失敗テストの再現ログから、`scrollTop` が 10px 低下する事象を確認。
2. `onScroll` で保存した `pendingAnchorLineRef` が `renderedHtml` 更新時に再適用され、
   編集中の `scrollTop` を行単位で丸めてしまうことを原因として確定。
3. 修正方針を「編集モード中は `onPaneScroll` でアンカー更新しない」に変更。
4. これにより、モード切替の行同期は維持しつつ、改行なし入力中の `scrollTop` 固定を優先する。
5. `src/App.tsx` の `onPaneScroll` に `targetMode === "edit"` 早期 return を追加して実装完了。
6. `npm run test` と `npx playwright test` で回帰確認を実施し、全件成功。
