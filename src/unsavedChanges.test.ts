import { hasUnsavedChanges } from "./unsavedChanges";

describe("hasUnsavedChanges", () => {
  it("returns false when content matches baseline", () => {
    expect(hasUnsavedChanges("same", "same")).toBe(false);
  });

  it("returns true when content differs from baseline", () => {
    expect(hasUnsavedChanges("edited", "original")).toBe(true);
  });
});
