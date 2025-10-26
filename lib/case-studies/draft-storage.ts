export interface CaseStudyDraftSection {
  title: string;
  content: string;
}

export interface CaseStudyDraftData {
  title: string;
  audience: string;
  headline: string;
  summary: string;
  background: string;
  results: string;
  sections: CaseStudyDraftSection[];
}

export interface CaseStudyDraftSectionState extends CaseStudyDraftSection {
  id?: string;
  position: number;
}

const STORAGE_KEY = "case-study-editor-draft";

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.error("Unable to access localStorage for case study drafts", error);
    return null;
  }
}

function normalizeDraft(draft: Partial<CaseStudyDraftData> | null | undefined): CaseStudyDraftData {
  const normalizedSections: CaseStudyDraftSection[] = [];

  if (draft && Array.isArray(draft.sections)) {
    const sections = draft.sections as (Partial<CaseStudyDraftSection> | null | undefined)[];
    for (const section of sections) {
      const rawTitle = typeof section?.title === "string" ? section.title : "";
      const rawContent = typeof section?.content === "string" ? section.content : "";

      if (rawTitle.trim().length === 0 && rawContent.trim().length === 0) {
        continue;
      }

      normalizedSections.push({ title: rawTitle, content: rawContent });
    }
  }

  return {
    title: draft?.title ?? "",
    audience: draft?.audience ?? "",
    headline: draft?.headline ?? "",
    summary: draft?.summary ?? "",
    background: draft?.background ?? "",
    results: draft?.results ?? "",
    sections: normalizedSections,
  } satisfies CaseStudyDraftData;
}

export function loadCaseStudyDraft(): CaseStudyDraftData | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<CaseStudyDraftData>;
    return normalizeDraft(parsed);
  } catch (error) {
    console.error("Failed to load case study draft", error);
    return null;
  }
}

export function saveCaseStudyDraft(draft: CaseStudyDraftData): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalizeDraft(draft)));
  } catch (error) {
    console.error("Failed to save case study draft", error);
  }
}

export function clearCaseStudyDraft(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear case study draft", error);
  }
}

function createSectionKey(title: string, content: string): string {
  return `${title.trim().toLowerCase()}::${content.trim().toLowerCase()}`;
}

export function mergeDraftSections(
  existing: CaseStudyDraftSectionState[],
  draftSections: CaseStudyDraftSection[],
): CaseStudyDraftSectionState[] {
  const merged: CaseStudyDraftSectionState[] = existing.map((section, index) => ({
    ...section,
    position: index,
  }));

  const seenKeys = new Set(merged.map((section) => createSectionKey(section.title, section.content)));

  for (const section of draftSections) {
    const key = createSectionKey(section.title, section.content);
    if (seenKeys.has(key)) {
      continue;
    }

    merged.push({
      title: section.title,
      content: section.content,
      position: merged.length,
    });
    seenKeys.add(key);
  }

  return merged.map((section, index) => ({ ...section, position: index }));
}

export function buildDraftSnapshot(
  override: Partial<CaseStudyDraftData>,
  previous?: CaseStudyDraftData | null,
): CaseStudyDraftData {
  const base = previous ?? normalizeDraft(null);
  const sections = Array.isArray(override.sections) ? override.sections : base.sections;

  return {
    title: override.title ?? base.title,
    audience: override.audience ?? base.audience,
    headline: override.headline ?? base.headline,
    summary: override.summary ?? base.summary,
    background: override.background ?? base.background,
    results: override.results ?? base.results,
    sections,
  };
}
