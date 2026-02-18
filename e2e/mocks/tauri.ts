import { Page } from "@playwright/test";

type TauriMockConfig = {
  openPath?: string | null;
  savePath?: string | null;
  files?: Record<string, string>;
};

type TauriCall = {
  cmd: string;
  details: Record<string, unknown>;
};

type TauriMockState = {
  calls: TauriCall[];
  files: Record<string, string>;
};

const DEFAULT_OPEN_PATH = "/mock/path/to/existing_note.md";
const DEFAULT_SAVE_PATH = "/mock/path/to/hikari_note.md";
const DEFAULT_FILES: Record<string, string> = {
  [DEFAULT_OPEN_PATH]: "# Hello from Mock File\n\nこれはテスト用の偽ファイルです。",
};

export async function mockTauriPlugin(
  page: Page,
  config: TauriMockConfig = {},
) {
  const normalized = {
    openPath: config.openPath ?? DEFAULT_OPEN_PATH,
    savePath: config.savePath ?? DEFAULT_SAVE_PATH,
    files: { ...DEFAULT_FILES, ...(config.files ?? {}) },
  };

  await page.addInitScript((initialConfig: typeof normalized) => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const state: TauriMockState = {
      calls: [],
      files: { ...initialConfig.files },
    };

    (window as unknown as { __TAURI_MOCK_STATE: TauriMockState }).__TAURI_MOCK_STATE =
      state;

    const internals = (window as any).__TAURI_INTERNALS__ ?? {};

    internals.invoke = async (
      cmd: string,
      args?: Record<string, unknown>,
      options?: Record<string, unknown>,
    ) => {
      if (cmd === "plugin:dialog|open") {
        const dialogOptions = (args?.options as Record<string, unknown>) ?? {};
        state.calls.push({ cmd, details: { options: dialogOptions } });
        return initialConfig.openPath;
      }

      if (cmd === "plugin:dialog|save") {
        const dialogOptions = (args?.options as Record<string, unknown>) ?? {};
        state.calls.push({ cmd, details: { options: dialogOptions } });
        return initialConfig.savePath;
      }

      if (cmd === "plugin:fs|read_text_file") {
        const targetPath = String(args?.path ?? "");
        state.calls.push({ cmd, details: { path: targetPath } });
        const content = state.files[targetPath] ?? "";
        return encoder.encode(content);
      }

      if (cmd === "plugin:fs|write_text_file") {
        const payload = args as Uint8Array | ArrayLike<number> | undefined;
        const headers = (options?.headers as Record<string, string>) ?? {};
        const rawPath = headers.path ? decodeURIComponent(headers.path) : "";
        const bytes =
          payload instanceof Uint8Array ? payload : Uint8Array.from(payload ?? []);
        const content = decoder.decode(bytes);

        state.files[rawPath] = content;
        state.calls.push({
          cmd,
          details: { path: rawPath, content },
        });
        return null;
      }

      state.calls.push({ cmd, details: { args, options } });
      return null;
    };

    internals.transformCallback =
      internals.transformCallback ??
      ((callback: (...args: unknown[]) => unknown) => {
        const id = Math.floor(Math.random() * 1_000_000);
        (window as any)[`_${id}`] = callback;
        return id;
      });
    internals.unregisterCallback =
      internals.unregisterCallback ?? ((id: number) => delete (window as any)[`_${id}`]);
    internals.convertFileSrc =
      internals.convertFileSrc ?? ((path: string) => `asset://${path}`);

    (window as any).__TAURI_INTERNALS__ = internals;
  }, normalized);
}

export async function getTauriMockState(page: Page): Promise<TauriMockState> {
  return page.evaluate(() => {
    return (window as unknown as { __TAURI_MOCK_STATE: TauriMockState })
      .__TAURI_MOCK_STATE;
  });
}
