# Research: Open File from Windows Explorer (Issue #12)

## Root Cause Analysis

Currently the app has no mechanism to handle files passed via command-line arguments.
When Windows Explorer opens a file with an app, it passes the file path as `argv[1]`.

## Technical Approach

### Runtime (Tauri)
- Tauri `#[tauri::command]` can expose `std::env::args().nth(1)` to the frontend.
- Frontend calls `invoke("get_initial_file_path")` on mount and loads the file if a path is returned.

### OS Registration (Windows)
- `tauri.conf.json` → `bundle.fileAssociations` registers `.md`/`.markdown` in the installer.
- Takes effect after the app is installed via the bundled installer.

## Constraints
- File associations only apply after installation (not in dev mode).
- Runtime handling (argv parsing) works in both dev and production.
