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
