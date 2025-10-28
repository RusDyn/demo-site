export function encodePublicCaseStudySlug(authorId: string, slug: string): string {
  const encodedAuthorId = encodeURIComponent(authorId);
  const encodedSlug = encodeURIComponent(slug);
  return `${encodedAuthorId}~${encodedSlug}`;
}

export function decodePublicCaseStudySlug(
  publicSlug: string,
): { authorId: string; slug: string } | null {
  if (typeof publicSlug !== "string" || publicSlug.length === 0) {
    return null;
  }

  const separatorIndex = publicSlug.indexOf("~");
  if (separatorIndex <= 0 || separatorIndex === publicSlug.length - 1) {
    return null;
  }

  try {
    const authorId = decodeURIComponent(publicSlug.slice(0, separatorIndex));
    const slug = decodeURIComponent(publicSlug.slice(separatorIndex + 1));

    if (!authorId || !slug) {
      return null;
    }

    return { authorId, slug };
  } catch {
    return null;
  }
}
