import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface FileReadResult {
  path: string;
  content: string;
}

export interface FileIODeps {
  openDialog: typeof open;
  saveDialog: typeof save;
  readText: typeof readTextFile;
  writeText: typeof writeTextFile;
}

const defaultDeps: FileIODeps = {
  openDialog: open,
  saveDialog: save,
  readText: readTextFile,
  writeText: writeTextFile,
};

const markdownDialogFilters = [
  { name: "Markdown", extensions: ["md", "markdown"] },
];

function normalizeSelectedPath(path: string | string[] | null): string | null {
  if (Array.isArray(path)) {
    return path.length > 0 ? path[0] : null;
  }
  return path;
}

export async function importMarkdownFile(
  deps: FileIODeps = defaultDeps,
): Promise<FileReadResult | null> {
  const selected = await deps.openDialog({
    multiple: false,
    filters: markdownDialogFilters,
  });
  const filePath = normalizeSelectedPath(selected);
  if (!filePath) {
    return null;
  }

  const content = await deps.readText(filePath);
  return { path: filePath, content };
}

export async function saveMarkdownFile(
  path: string,
  content: string,
  deps: FileIODeps = defaultDeps,
): Promise<void> {
  await deps.writeText(path, content);
}

export async function saveMarkdownFileAs(
  content: string,
  currentPath: string | null,
  deps: FileIODeps = defaultDeps,
): Promise<string | null> {
  const targetPath = await deps.saveDialog({
    filters: markdownDialogFilters,
    defaultPath: currentPath ?? "untitled.md",
  });

  if (!targetPath) {
    return null;
  }

  await deps.writeText(targetPath, content);
  return targetPath;
}
