import { expect, test } from "@playwright/test";
import { getTauriMockState, mockTauriPlugin } from "./mocks/tauri";

test.beforeEach(async ({ page }) => {
  await mockTauriPlugin(page);
  await page.goto("/");
});

test("初期表示は編集モード", async ({ page }) => {
  await expect(page.getByLabel("Markdown Editor")).toBeVisible();
  await expect(page.getByLabel("Markdown Preview")).toBeHidden();
  await expect(page.getByRole("button", { name: "プレビューモードへ" })).toBeVisible();
  await expect(page.getByText("モード: 編集")).toBeVisible();
  await expect(page.getByText("ファイル: 未保存")).toBeVisible();
  await expect(page.getByText("新規ドキュメント")).toBeVisible();
});

test("編集とプレビューを切り替えできる", async ({ page }) => {
  await page.getByRole("button", { name: "プレビューモードへ" }).click();
  await expect(page.getByLabel("Markdown Preview")).toBeVisible();
  await expect(page.getByLabel("Markdown Editor")).toBeHidden();
  await expect(page.getByRole("button", { name: "編集モードへ" })).toBeVisible();
  await expect(page.getByText("モード: プレビュー")).toBeVisible();
});

test("Markdownプレビューの描画とサニタイズ", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill(
    "# 見出し\n\n*italic*\n\n<img src=x onerror=alert(1)>\n\n$$a^2+b^2=c^2$$",
  );

  await page.getByRole("button", { name: "プレビューモードへ" }).click();
  const preview = page.getByLabel("Markdown Preview");
  await expect(preview.getByRole("heading", { name: "見出し" })).toBeVisible();
  await expect(preview.locator("em")).toContainText("italic");
  await expect(preview.locator(".katex")).toHaveCount(1);
  await expect(preview.locator("script")).toHaveCount(0);
  await expect(preview.locator("img[onerror]")).toHaveCount(0);
});

test("開くで内容を読み込み、状態バーを更新する", async ({ page }) => {
  await page.getByRole("button", { name: "開く" }).click();

  await expect(page.getByLabel("Markdown Editor")).toHaveValue(
    "# Hello from Mock File\n\nこれはテスト用の偽ファイルです。",
  );
  await expect(
    page.getByText("ファイル: /mock/path/to/existing_note.md"),
  ).toBeVisible();
  await expect(
    page.getByText("読み込み完了: /mock/path/to/existing_note.md"),
  ).toBeVisible();

  const mock = await getTauriMockState(page);
  expect(mock.calls.map((c) => c.cmd)).toContain("plugin:dialog|open");
  expect(mock.calls.map((c) => c.cmd)).toContain("plugin:fs|read_text_file");
});

test("新規ボタンで初期状態へ戻し未保存内容を破棄する", async ({ page }) => {
  const actionButtons = page.locator(".actions > button");
  await expect(actionButtons.nth(0)).toHaveText("新規");
  await expect(actionButtons.nth(1)).toHaveText("開く");

  await page.getByRole("button", { name: "開く" }).click();
  await page.getByRole("button", { name: "プレビューモードへ" }).click();
  await page.getByRole("button", { name: "新規" }).click();

  const editor = page.getByLabel("Markdown Editor");
  await expect(editor).toBeVisible();
  await expect(page.getByLabel("Markdown Preview")).toBeHidden();
  await expect(editor).toHaveValue("");
  await expect(page.getByText("モード: 編集")).toBeVisible();
  await expect(page.getByText("ファイル: 未保存")).toBeVisible();
  await expect(page.getByText("新規ドキュメント")).toBeVisible();

  await editor.fill("temporary draft");
  await page.getByRole("button", { name: "新規" }).click();
  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toBeVisible();
  await page.getByRole("button", { name: "破棄" }).click();

  await expect(editor).toHaveValue("");
  await expect(page.getByText("ファイル: 未保存")).toBeVisible();
  await expect(page.getByText("新規ドキュメント")).toBeVisible();
});

test("未保存状態で新規を押して保存を選ぶと保存後に新規作成される", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("# Draft before new");

  await page.getByRole("button", { name: "新規" }).click();
  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toBeVisible();
  await page.getByRole("button", { name: "保存", exact: true }).click();

  await expect(page.getByText("ファイル: 未保存")).toBeVisible();
  await expect(page.getByText("新規ドキュメント")).toBeVisible();
  await expect(editor).toHaveValue("");

  const mock = await getTauriMockState(page);
  const saveCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|save");
  const writeCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|write_text_file");

  expect(saveCalls).toHaveLength(1);
  expect(writeCalls).toHaveLength(1);
  expect(writeCalls[0]?.details.path).toBe("/mock/path/to/hikari_note.md");
  expect(writeCalls[0]?.details.content).toBe("# Draft before new");
});

test("未保存状態で開くを押して破棄を選ぶと保存せず開く", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("discard this draft");

  await page.getByRole("button", { name: "開く" }).click();
  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toBeVisible();
  await page.getByRole("button", { name: "破棄" }).click();

  await expect(editor).toHaveValue("# Hello from Mock File\n\nこれはテスト用の偽ファイルです。");
  await expect(
    page.getByText("読み込み完了: /mock/path/to/existing_note.md"),
  ).toBeVisible();

  const mock = await getTauriMockState(page);
  const openCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|open");
  const readCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|read_text_file");
  const saveCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|save");
  const writeCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|write_text_file");

  expect(openCalls).toHaveLength(1);
  expect(readCalls).toHaveLength(1);
  expect(saveCalls).toHaveLength(0);
  expect(writeCalls).toHaveLength(0);
});

test("未保存状態で開くを押して保存を選ぶと保存後に開く", async ({ page }) => {
  await page.getByRole("button", { name: "開く" }).click();

  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("edited existing file");
  await page.getByRole("button", { name: "開く" }).click();
  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toBeVisible();
  await page.getByRole("button", { name: "保存", exact: true }).click();

  await expect(editor).toHaveValue("edited existing file");
  await expect(
    page.getByText("読み込み完了: /mock/path/to/existing_note.md"),
  ).toBeVisible();

  const mock = await getTauriMockState(page);
  const openCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|open");
  const readCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|read_text_file");
  const saveCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|save");
  const writeCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|write_text_file");

  expect(openCalls).toHaveLength(2);
  expect(readCalls).toHaveLength(2);
  expect(saveCalls).toHaveLength(0);
  expect(writeCalls).toHaveLength(1);
  expect(writeCalls[0]?.details.path).toBe("/mock/path/to/existing_note.md");
  expect(writeCalls[0]?.details.content).toBe("edited existing file");
});

test("未保存状態で新規を押してキャンセルを選ぶとダイアログが閉じ何も変わらない", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("cancel this draft");

  await page.getByRole("button", { name: "新規" }).click();
  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toBeVisible();
  await page.getByRole("button", { name: "キャンセル" }).click();

  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toHaveCount(0);
  await expect(editor).toHaveValue("cancel this draft");
  await expect(page.getByText("ファイル: 未保存")).toBeVisible();

  const mock = await getTauriMockState(page);
  expect(mock.calls.map((c) => c.cmd)).not.toContain("plugin:dialog|save");
  expect(mock.calls.map((c) => c.cmd)).not.toContain("plugin:fs|write_text_file");
});

test("未保存状態で開くを押してキャンセルを選ぶとダイアログが閉じ何も変わらない", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("cancel open draft");

  await page.getByRole("button", { name: "開く" }).click();
  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toBeVisible();
  await page.getByRole("button", { name: "キャンセル" }).click();

  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toHaveCount(0);
  await expect(editor).toHaveValue("cancel open draft");
  await expect(page.getByText("ファイル: 未保存")).toBeVisible();

  const mock = await getTauriMockState(page);
  expect(mock.calls.map((c) => c.cmd)).not.toContain("plugin:dialog|open");
  expect(mock.calls.map((c) => c.cmd)).not.toContain("plugin:fs|read_text_file");
});

test("開いたファイルを未編集のまま新規を押しても警告しない", async ({ page }) => {
  await page.getByRole("button", { name: "開く" }).click();
  await page.getByRole("button", { name: "新規" }).click();

  await expect(page.getByRole("dialog", { name: "未保存の変更があります" })).toHaveCount(0);
  await expect(page.getByLabel("Markdown Editor")).toHaveValue("");
  await expect(page.getByText("新規ドキュメント")).toBeVisible();
});

test("未保存ドキュメントの上書き保存は Save As フローになる", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("# First Draft");
  await page.getByRole("button", { name: "上書き保存" }).click();

  await expect(
    page.getByText("保存完了: /mock/path/to/hikari_note.md"),
  ).toBeVisible();
  await expect(
    page.getByText("ファイル: /mock/path/to/hikari_note.md"),
  ).toBeVisible();
  await expect(page.locator(".save-feedback.visible")).toHaveText("保存しました");

  const mock = await getTauriMockState(page);
  const saveCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|save");
  const writeCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|write_text_file");

  expect(saveCalls).toHaveLength(1);
  expect(writeCalls).toHaveLength(1);
  expect(writeCalls[0]?.details.path).toBe("/mock/path/to/hikari_note.md");
  expect(writeCalls[0]?.details.content).toBe("# First Draft");
});

test("既存ファイルの上書き保存はダイアログを出さず同じパスへ保存する", async ({ page }) => {
  await page.getByRole("button", { name: "開く" }).click();
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("updated content");
  await page.getByRole("button", { name: "上書き保存" }).click();

  await expect(
    page.getByText("上書き保存完了: /mock/path/to/existing_note.md"),
  ).toBeVisible();

  const saveButton = page.getByRole("button", { name: "上書き保存" });
  await expect(saveButton).toHaveClass(/is-saved/);
  await expect(page.locator(".save-feedback.visible")).toHaveText("保存しました");

  const mock = await getTauriMockState(page);
  const saveCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|save");
  const writeCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|write_text_file");

  expect(saveCalls).toHaveLength(0);
  expect(writeCalls).toHaveLength(1);
  expect(writeCalls[0]?.details.path).toBe("/mock/path/to/existing_note.md");
  expect(writeCalls[0]?.details.content).toBe("updated content");
});

test("名前を付けて保存は currentPath を defaultPath として使う", async ({ page }) => {
  await mockTauriPlugin(page, { savePath: "/mock/path/to/renamed_note.md" });
  await page.goto("/");

  await page.getByRole("button", { name: "開く" }).click();
  await page.getByRole("button", { name: "名前を付けて保存" }).click();

  await expect(
    page.getByText("名前を付けて保存完了: /mock/path/to/renamed_note.md"),
  ).toBeVisible();
  await expect(
    page.getByText("ファイル: /mock/path/to/renamed_note.md"),
  ).toBeVisible();

  const mock = await getTauriMockState(page);
  const saveCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|save");
  expect(saveCalls).toHaveLength(1);
  expect(saveCalls[0]?.details.options).toMatchObject({
    defaultPath: "/mock/path/to/existing_note.md",
  });
});

test("Ctrl+S: 未保存ドキュメントは Save As フローになる", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("# Shortcut Draft");
  await editor.focus();

  await page.keyboard.press("Control+S");

  await expect(
    page.getByText("保存完了: /mock/path/to/hikari_note.md"),
  ).toBeVisible();
  await expect(
    page.getByText("ファイル: /mock/path/to/hikari_note.md"),
  ).toBeVisible();

  const mock = await getTauriMockState(page);
  const saveCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|save");
  const writeCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|write_text_file");

  expect(saveCalls).toHaveLength(1);
  expect(writeCalls).toHaveLength(1);
  expect(writeCalls[0]?.details.path).toBe("/mock/path/to/hikari_note.md");
  expect(writeCalls[0]?.details.content).toBe("# Shortcut Draft");
});

test("Ctrl+S: 既存ファイルは上書き保存する", async ({ page }) => {
  await page.getByRole("button", { name: "開く" }).click();

  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("shortcut overwrite");
  await editor.focus();

  await page.keyboard.press("Control+S");

  await expect(
    page.getByText("上書き保存完了: /mock/path/to/existing_note.md"),
  ).toBeVisible();

  const mock = await getTauriMockState(page);
  const saveCalls = mock.calls.filter((c) => c.cmd === "plugin:dialog|save");
  const writeCalls = mock.calls.filter((c) => c.cmd === "plugin:fs|write_text_file");

  expect(saveCalls).toHaveLength(0);
  expect(writeCalls).toHaveLength(1);
  expect(writeCalls[0]?.details.path).toBe("/mock/path/to/existing_note.md");
  expect(writeCalls[0]?.details.content).toBe("shortcut overwrite");
});

test("Ctrl+E: 編集/プレビューをトグル切り替えする", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.focus();

  await expect(page.getByRole("button", { name: "プレビューモードへ" })).toBeVisible();

  await page.keyboard.press("Control+E");
  await expect(page.getByRole("button", { name: "編集モードへ" })).toBeVisible();
  await expect(page.getByText("モード: プレビュー")).toBeVisible();

  await page.keyboard.press("Control+E");
  await expect(page.getByRole("button", { name: "プレビューモードへ" })).toBeVisible();
  await expect(page.getByText("モード: 編集")).toBeVisible();
});

test("編集→プレビュー→編集で選択範囲とフォーカスを復元する", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("line-1\nline-2\nline-3\nline-4");

  await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(7, 17);
  });

  await page.getByRole("button", { name: "プレビューモードへ" }).click();
  await page.getByRole("button", { name: "編集モードへ" }).click();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const textarea = document.querySelector(
        '[aria-label="Markdown Editor"]',
      ) as HTMLTextAreaElement;
      return {
        focused: document.activeElement === textarea,
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
    });
  }).toEqual({
    focused: true,
    start: 7,
    end: 17,
  });
});

test("最下行編集中に下端の可視余白を維持する", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  const content = Array.from({ length: 180 }, (_, index) => `line-${index + 1}`).join(
    "\n",
  );
  await editor.fill(content);

  await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
    textarea.scrollTop = textarea.scrollHeight;
  });

  await editor.type("abcdefghij");

  const result = await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    const style = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(style.lineHeight);
    return {
      focused: document.activeElement === textarea,
      atEnd:
        textarea.selectionStart === textarea.value.length &&
        textarea.selectionEnd === textarea.value.length,
      paddingBottom: Number.parseFloat(style.paddingBottom),
      scrollPaddingBottom: Number.parseFloat(style.scrollPaddingBottom),
      lineHeight: Number.isFinite(lineHeight) ? lineHeight : 24,
    };
  });

  expect(result.focused).toBe(true);
  expect(result.atEnd).toBe(true);
  expect(result.paddingBottom).toBeGreaterThan(20);
  expect(result.scrollPaddingBottom).toBeGreaterThanOrEqual(result.lineHeight * 0.7);
});

test("最下段で改行挿入後に入力しても末尾行が潜らない", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  const content = Array.from({ length: 200 }, (_, index) => `row-${index + 1}`).join(
    "\n",
  );
  await editor.fill(content);

  await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
    textarea.scrollTop = textarea.scrollHeight;
  });

  await page.keyboard.press("Enter");
  await editor.type("gggggggg");

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const textarea = document.querySelector(
          '[aria-label="Markdown Editor"]',
        ) as HTMLTextAreaElement;
        return document.activeElement === textarea;
      });
    })
    .toBe(true);

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const textarea = document.querySelector(
          '[aria-label="Markdown Editor"]',
        ) as HTMLTextAreaElement;
        return (
          textarea.selectionStart === textarea.value.length &&
          textarea.selectionEnd === textarea.value.length
        );
      });
    })
    .toBe(true);

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const textarea = document.querySelector(
          '[aria-label="Markdown Editor"]',
        ) as HTMLTextAreaElement;
        const style = window.getComputedStyle(textarea);
        const lineHeight = Number.parseFloat(style.lineHeight);
        return lineHeight % 1;
      });
    })
    .toBe(0);

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const textarea = document.querySelector(
          '[aria-label="Markdown Editor"]',
        ) as HTMLTextAreaElement;
        const style = window.getComputedStyle(textarea);
        const lineHeight = Number.parseFloat(style.lineHeight);
        const maxScrollTop = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
        const distanceFromBottom = Math.abs(maxScrollTop - textarea.scrollTop);
        return distanceFromBottom <= lineHeight;
      });
    })
    .toBe(true);
});

test("最下段で改行なし入力中は scrollTop を固定する", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  const content = Array.from({ length: 220 }, (_, index) => `line-${index + 1}`).join(
    "\n",
  );
  await editor.fill(content);

  await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
    textarea.scrollTop = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
  });

  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    textarea.scrollTop = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
  });

  const initialScrollTop = await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    return textarea.scrollTop;
  });

  for (const key of "abcdefghij") {
    await editor.type(key);
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const textarea = document.querySelector(
            '[aria-label="Markdown Editor"]',
          ) as HTMLTextAreaElement;
          return textarea.scrollTop;
        });
      })
      .toBe(initialScrollTop);
  }

  const finalState = await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    return {
      scrollTop: textarea.scrollTop,
      atEnd:
        textarea.selectionStart === textarea.value.length &&
        textarea.selectionEnd === textarea.value.length,
      focused: document.activeElement === textarea,
    };
  });

  expect(finalState.scrollTop).toBe(initialScrollTop);
  expect(finalState.atEnd).toBe(true);
  expect(finalState.focused).toBe(true);
});

test("ステータスバーに文字数がリアルタイム表示される", async ({ page }) => {
  // 初期状態は 0文字
  await expect(page.locator(".char-count")).toHaveText("0文字");

  // 日本語入力で文字数が更新される
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("こんにちは");
  await expect(page.locator(".char-count")).toHaveText("5文字");

  // ASCII 文字も正しくカウントされる
  await editor.fill("Hello");
  await expect(page.locator(".char-count")).toHaveText("5文字");

  // 1000文字以上でカンマ区切り表示
  const longText = "あ".repeat(1000);
  await editor.fill(longText);
  await expect(page.locator(".char-count")).toHaveText("1,000文字");
});

test("文字数は新規作成後に0にリセットされる", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  await editor.fill("テスト内容");
  await expect(page.locator(".char-count")).toHaveText("5文字");

  await page.getByRole("button", { name: "新規" }).click();
  await page.getByRole("button", { name: "破棄" }).click();
  await expect(page.locator(".char-count")).toHaveText("0文字");
});

test("スクロール可能な文書の途中で改行しても最下部へジャンプしない", async ({ page }) => {
  const editor = page.getByLabel("Markdown Editor");
  const content = Array.from({ length: 320 }, (_, index) => `middle-row-${index + 1}`).join(
    "\n",
  );
  await editor.fill(content);

  const initialState = await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;
    const style = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(style.lineHeight) || 24;
    const targetLine = 150;

    const lines = textarea.value.split("\n");
    const caretIndex = lines
      .slice(0, targetLine - 1)
      .reduce((sum, line) => sum + line.length + 1, 0);

    textarea.focus();
    textarea.setSelectionRange(caretIndex, caretIndex);
    textarea.scrollTop = Math.max(0, lineHeight * 120);

    return {
      scrollTop: textarea.scrollTop,
      lineHeight,
    };
  });

  await page.keyboard.press("Enter");

  const result = await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="Markdown Editor"]',
    ) as HTMLTextAreaElement;

    const maxScrollTop = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
    return {
      scrollTop: textarea.scrollTop,
      maxScrollTop,
    };
  });

  const drift = Math.abs(result.scrollTop - initialState.scrollTop);
  const distanceFromBottom = result.maxScrollTop - result.scrollTop;

  expect(drift).toBeLessThanOrEqual(initialState.lineHeight * 20);
  expect(distanceFromBottom).toBeGreaterThan(initialState.lineHeight * 40);
});
