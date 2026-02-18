import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  importMarkdownFile,
  saveMarkdownFile,
  saveMarkdownFileAs,
} from "./fileIO";
import { renderMarkdownToSafeHtml } from "./markdown";

type EditorMode = "edit" | "preview";
type EditorSelection = { start: number; end: number };

const INITIAL_MARKDOWN = "";

function getLineHeight(element: HTMLElement): number {
  const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);
  return Number.isFinite(lineHeight) && lineHeight > 0 ? lineHeight : 24;
}

function getEditorTopLine(textarea: HTMLTextAreaElement | null): number {
  if (!textarea) {
    return 1;
  }
  const lineHeight = getLineHeight(textarea);
  return Math.max(1, Math.floor(textarea.scrollTop / lineHeight) + 1);
}

function restoreEditorToLine(
  textarea: HTMLTextAreaElement | null,
  targetLine: number,
): void {
  if (!textarea) {
    return;
  }
  const lineHeight = getLineHeight(textarea);
  textarea.scrollTop = Math.max(0, (targetLine - 1) * lineHeight);
}

function stabilizeEditorBottomLine(textarea: HTMLTextAreaElement | null): void {
  if (!textarea) {
    return;
  }

  const lineHeight = getLineHeight(textarea);
  const bottomGap = textarea.scrollHeight - (textarea.scrollTop + textarea.clientHeight);
  if (bottomGap <= lineHeight) {
    textarea.scrollTop = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
  }
}

function getPreviewTopLine(preview: HTMLDivElement | null): number {
  if (!preview) {
    return 1;
  }

  const scrollTop = preview.scrollTop;
  const elements = preview.querySelectorAll<HTMLElement>("[data-source-line]");
  let bestLine = 1;

  for (const element of elements) {
    const line = Number.parseInt(
      element.getAttribute("data-source-line") ?? "1",
      10,
    );
    if (!Number.isFinite(line)) {
      continue;
    }
    if (element.offsetTop <= scrollTop + 1) {
      bestLine = line;
    } else {
      break;
    }
  }

  return Math.max(1, bestLine);
}

function restorePreviewToLine(
  preview: HTMLDivElement | null,
  targetLine: number,
): void {
  if (!preview) {
    return;
  }

  const elements = preview.querySelectorAll<HTMLElement>("[data-source-line]");
  if (elements.length === 0) {
    return;
  }

  let targetElement: HTMLElement | null = null;
  for (const element of elements) {
    const line = Number.parseInt(
      element.getAttribute("data-source-line") ?? "1",
      10,
    );
    if (!Number.isFinite(line)) {
      continue;
    }
    if (line >= targetLine) {
      targetElement = element;
      break;
    }
  }

  if (!targetElement) {
    targetElement = elements[elements.length - 1];
  }

  preview.scrollTop = Math.max(0, targetElement.offsetTop);
}

function App() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [mode, setMode] = useState<EditorMode>("edit");
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("新規ドキュメント");
  const [savePulseVisible, setSavePulseVisible] = useState(false);
  const [saveNoticeVisible, setSaveNoticeVisible] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const pendingAnchorLineRef = useRef<number | null>(null);
  const editorSelectionRef = useRef<EditorSelection>({ start: 0, end: 0 });
  const returnToEditorRefocusRef = useRef(false);
  const keepEditorBottomAnchoredRef = useRef(false);

  const renderedHtml = useMemo(
    () => renderMarkdownToSafeHtml(markdown),
    [markdown],
  );

  const getTopLineForMode = (targetMode: EditorMode): number => {
    return targetMode === "edit"
      ? getEditorTopLine(editorRef.current)
      : getPreviewTopLine(previewRef.current);
  };

  const restoreTopLineForMode = (targetMode: EditorMode, line: number): void => {
    if (targetMode === "edit") {
      restoreEditorToLine(editorRef.current, line);
      return;
    }
    restorePreviewToLine(previewRef.current, line);
  };

  const captureEditorSelection = () => {
    const textarea = editorRef.current;
    if (!textarea) {
      return;
    }
    editorSelectionRef.current = {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0,
    };
  };

  const toggleMode = () => {
    if (mode === "edit") {
      captureEditorSelection();
      returnToEditorRefocusRef.current = true;
    }

    pendingAnchorLineRef.current = getTopLineForMode(mode);
    setMode((prev) => (prev === "edit" ? "preview" : "edit"));
  };

  useEffect(() => {
    const line = pendingAnchorLineRef.current;
    if (line === null) {
      return;
    }

    requestAnimationFrame(() => {
      restoreTopLineForMode(mode, line);
      pendingAnchorLineRef.current = null;

      if (mode === "edit" && returnToEditorRefocusRef.current) {
        const textarea = editorRef.current;
        if (!textarea) {
          return;
        }

        const max = textarea.value.length;
        const start = Math.min(editorSelectionRef.current.start, max);
        const end = Math.min(editorSelectionRef.current.end, max);

        textarea.focus();
        textarea.setSelectionRange(start, end);
        returnToEditorRefocusRef.current = false;
      }
    });
  }, [mode, renderedHtml]);

  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) {
      return;
    }

    const applyBottomScrollPadding = () => {
      const lineHeight = getLineHeight(textarea);
      textarea.style.scrollPaddingBottom = `${Math.ceil(lineHeight * 0.8)}px`;
    };

    applyBottomScrollPadding();
    window.addEventListener("resize", applyBottomScrollPadding);
    return () => window.removeEventListener("resize", applyBottomScrollPadding);
  }, []);

  useLayoutEffect(() => {
    if (!keepEditorBottomAnchoredRef.current) {
      return;
    }

    const textarea = editorRef.current;
    if (!textarea) {
      return;
    }

    const snapToBottom = () => {
      textarea.scrollTop = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
    };

    snapToBottom();
    requestAnimationFrame(snapToBottom);
  }, [markdown]);

  useEffect(() => {
    if (!savePulseVisible) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setSavePulseVisible(false);
    }, 650);
    return () => window.clearTimeout(timerId);
  }, [savePulseVisible]);

  useEffect(() => {
    if (!saveNoticeVisible) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setSaveNoticeVisible(false);
    }, 1400);
    return () => window.clearTimeout(timerId);
  }, [saveNoticeVisible]);

  const showSaveFeedback = (options: { pulse: boolean }) => {
    if (options.pulse) {
      setSavePulseVisible(false);
      requestAnimationFrame(() => setSavePulseVisible(true));
    }

    setSaveNoticeVisible(false);
    requestAnimationFrame(() => setSaveNoticeVisible(true));
  };

  const handleImport = async () => {
    try {
      const file = await importMarkdownFile();
      if (!file) {
        return;
      }
      setMarkdown(file.content);
      setCurrentFilePath(file.path);
      editorSelectionRef.current = { start: 0, end: 0 };
      setStatusMessage(`読み込み完了: ${file.path}`);
    } catch (error) {
      setStatusMessage(`読み込み失敗: ${String(error)}`);
    }
  };

  const handleSave = async () => {
    try {
      if (!currentFilePath) {
        const path = await saveMarkdownFileAs(markdown, null);
        if (!path) {
          return;
        }
        setCurrentFilePath(path);
        setStatusMessage(`保存完了: ${path}`);
        showSaveFeedback({ pulse: false });
        return;
      }

      await saveMarkdownFile(currentFilePath, markdown);
      setStatusMessage(`上書き保存完了: ${currentFilePath}`);
      showSaveFeedback({ pulse: true });
    } catch (error) {
      setStatusMessage(`保存失敗: ${String(error)}`);
    }
  };

  const handleSaveAs = async () => {
    try {
      const path = await saveMarkdownFileAs(markdown, currentFilePath);
      if (!path) {
        return;
      }
      setCurrentFilePath(path);
      setStatusMessage(`名前を付けて保存完了: ${path}`);
      showSaveFeedback({ pulse: false });
    } catch (error) {
      setStatusMessage(`保存失敗: ${String(error)}`);
    }
  };

  const currentFileLabel = currentFilePath ?? "未保存";
  const isEditMode = mode === "edit";
  const isPreviewMode = mode === "preview";

  const onPaneScroll = (targetMode: EditorMode) => {
    if (targetMode !== mode) {
      return;
    }
    pendingAnchorLineRef.current = getTopLineForMode(targetMode);
  };

  return (
    <main className="app-shell">
      <header className="toolbar">
        <div className="actions">
          <button type="button" onClick={handleImport}>
            開く
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={savePulseVisible ? "is-saved" : ""}
          >
            上書き保存
          </button>
          <button type="button" onClick={handleSaveAs}>
            名前を付けて保存
          </button>
        </div>

        <button type="button" onClick={toggleMode}>
          {isEditMode ? "プレビューモードへ" : "編集モードへ"}
        </button>
      </header>

      <section className="workspace">
        <textarea
          ref={editorRef}
          className={`pane editor-pane ${isEditMode ? "active" : "inactive"}`}
          value={markdown}
          onChange={(event) => {
            const textarea = event.currentTarget;
            const lineHeight = getLineHeight(textarea);
            const bottomGap = textarea.scrollHeight - (textarea.scrollTop + textarea.clientHeight);
            const caretAtEnd =
              (textarea.selectionStart ?? 0) === textarea.value.length &&
              (textarea.selectionEnd ?? 0) === textarea.value.length;
            keepEditorBottomAnchoredRef.current =
              caretAtEnd && bottomGap <= lineHeight * 1.5;

            setMarkdown(event.currentTarget.value);
            editorSelectionRef.current = {
              start: textarea.selectionStart ?? 0,
              end: textarea.selectionEnd ?? 0,
            };
            stabilizeEditorBottomLine(textarea);
            requestAnimationFrame(() => {
              stabilizeEditorBottomLine(editorRef.current);
            });
          }}
          onSelect={captureEditorSelection}
          onClick={captureEditorSelection}
          onKeyUp={captureEditorSelection}
          onScroll={() => onPaneScroll("edit")}
          spellCheck={false}
          aria-label="Markdown Editor"
        />

        <article
          ref={previewRef}
          className={`pane preview-pane ${isPreviewMode ? "active" : "inactive"}`}
          onScroll={() => onPaneScroll("preview")}
          aria-label="Markdown Preview"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </section>

      <footer className="status-bar">
        <span>モード: {isEditMode ? "編集" : "プレビュー"}</span>
        <span>ファイル: {currentFileLabel}</span>
        <span>{statusMessage}</span>
        <span
          className={`save-feedback ${saveNoticeVisible ? "visible" : ""}`}
          aria-live="polite"
        >
          保存しました
        </span>
      </footer>
    </main>
  );
}

export default App;
