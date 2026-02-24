export function hasUnsavedChanges(
  currentMarkdown: string,
  baselineMarkdown: string,
): boolean {
  return currentMarkdown !== baselineMarkdown;
}
