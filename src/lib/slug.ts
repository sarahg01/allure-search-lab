export function makeSlug(title: string | null | undefined): string {
  const base = (title || "look")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "look";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}
