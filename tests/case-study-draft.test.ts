import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildDraftSnapshot,
  mergeDraftSections,
  type CaseStudyDraftData,
  type CaseStudyDraftSection,
  type CaseStudyDraftSectionState,
} from "@/lib/case-studies/draft-storage";

test("mergeDraftSections keeps existing sections and appends new ones with positions", () => {
  const existing: CaseStudyDraftSectionState[] = [
    { id: "existing-1", title: "Intro", content: "Existing intro", position: 0 },
  ];
  const draftSections: CaseStudyDraftSection[] = [
    { title: "Intro", content: "Existing intro" },
    { title: "Outcome", content: "Key wins" },
  ];

  const merged = mergeDraftSections(existing, draftSections);

  assert.equal(merged.length, 2);
  assert.deepEqual(merged[0], { id: "existing-1", title: "Intro", content: "Existing intro", position: 0 });
  assert.deepEqual(merged[1], { title: "Outcome", content: "Key wins", position: 1 });
});

test("buildDraftSnapshot merges override fields with previous draft", () => {
  const previous: CaseStudyDraftData = {
    title: "Old title",
    audience: "Operators",
    headline: "Legacy headline",
    summary: "Old summary",
    background: "Old background",
    results: "Old results",
    sections: [{ title: "Intro", content: "Old content" }],
  };

  const override: Partial<CaseStudyDraftData> = {
    title: "New title",
    summary: "Fresh summary",
    sections: [
      { title: "Intro", content: "Old content" },
      { title: "Results", content: "New results" },
    ],
  };

  const snapshot = buildDraftSnapshot(override, previous);

  assert.deepEqual(snapshot, {
    title: "New title",
    audience: "Operators",
    headline: "Legacy headline",
    summary: "Fresh summary",
    background: "Old background",
    results: "Old results",
    sections: [
      { title: "Intro", content: "Old content" },
      { title: "Results", content: "New results" },
    ],
  });
});

test("draft hydration maps sections into action payload order", () => {
  const draft: CaseStudyDraftData = {
    title: "Customer success",
    audience: "Revenue leaders",
    headline: "Driving retention",
    summary: "Summary",
    background: "Background",
    results: "Results",
    sections: [
      { title: "Challenge", content: "Big challenge" },
      { title: "Outcome", content: "Huge win" },
    ],
  };

  const mergedSections = mergeDraftSections([], draft.sections);

  const payloadSections = mergedSections.map((section, index) => ({
    id: section.id,
    title: section.title,
    content: section.content,
    position: index,
  }));

  assert.deepEqual(payloadSections, [
    { id: undefined, title: "Challenge", content: "Big challenge", position: 0 },
    { id: undefined, title: "Outcome", content: "Huge win", position: 1 },
  ]);
});
