# Implementation Plan: Open File from Windows Explorer (Issue #12)

## Steps

1. **[DONE] ai-docs setup** — research.md, implementation.md, test.md created.

2. **E2E test (test-first)** — Add test to `e2e/app.spec.ts`:
   - Mock returns initial file path on `get_initial_file_path`
   - Verify content, file path, status message are shown on load.

3. **Update mock** — `e2e/mocks/tauri.ts`:
   - Add `initialFilePath` to `TauriMockConfig`.
   - Handle `get_initial_file_path` cmd in `internals.invoke`.

4. **`src/fileIO.ts`** — Add `readMarkdownFileByPath(path, deps)`.

5. **`src/App.tsx`** — Add `useEffect` on mount:
   - Call `invoke<string | null>("get_initial_file_path")`.
   - If non-null, call `readMarkdownFileByPath` and update state.

6. **`src-tauri/src/lib.rs`** — Add `get_initial_file_path` command.

7. **`src-tauri/tauri.conf.json`** — Add `bundle.fileAssociations` for `.md`/`.markdown`.

8. **Unit tests** — Add `readMarkdownFileByPath` tests to `src/fileIO.test.ts`.

## Status
- [ ] E2E test written (RED)
- [ ] Implementation complete
- [ ] Targeted E2E test GREEN
- [ ] Full suite GREEN
