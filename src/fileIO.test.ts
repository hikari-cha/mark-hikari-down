import {
  importMarkdownFile,
  saveMarkdownFile,
  saveMarkdownFileAs,
  type FileIODeps,
} from "./fileIO";

function createDeps(overrides: Partial<FileIODeps>): FileIODeps {
  return {
    openDialog: vi.fn(),
    saveDialog: vi.fn(),
    readText: vi.fn(),
    writeText: vi.fn(),
    ...overrides,
  };
}

describe("fileIO", () => {
  it("returns null when import is canceled", async () => {
    const deps = createDeps({
      openDialog: vi.fn().mockResolvedValue(null),
    });

    const result = await importMarkdownFile(deps);

    expect(result).toBeNull();
  });

  it("imports markdown content from selected file", async () => {
    const deps = createDeps({
      openDialog: vi.fn().mockResolvedValue("C:/tmp/demo.md"),
      readText: vi.fn().mockResolvedValue("# demo"),
    });

    const result = await importMarkdownFile(deps);

    expect(deps.readText).toHaveBeenCalledWith("C:/tmp/demo.md");
    expect(result).toEqual({ path: "C:/tmp/demo.md", content: "# demo" });
  });

  it("writes content with explicit save", async () => {
    const deps = createDeps({});

    await saveMarkdownFile("C:/tmp/demo.md", "body", deps);

    expect(deps.writeText).toHaveBeenCalledWith("C:/tmp/demo.md", "body");
  });

  it("returns null when save-as is canceled", async () => {
    const deps = createDeps({
      saveDialog: vi.fn().mockResolvedValue(null),
    });

    const result = await saveMarkdownFileAs("body", null, deps);

    expect(result).toBeNull();
    expect(deps.writeText).not.toHaveBeenCalled();
  });

  it("writes file and returns path for save-as", async () => {
    const deps = createDeps({
      saveDialog: vi.fn().mockResolvedValue("C:/tmp/output.md"),
    });

    const result = await saveMarkdownFileAs("body", "C:/tmp/demo.md", deps);

    expect(deps.writeText).toHaveBeenCalledWith("C:/tmp/output.md", "body");
    expect(result).toBe("C:/tmp/output.md");
  });
});
