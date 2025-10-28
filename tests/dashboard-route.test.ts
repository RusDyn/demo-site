import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import React from "react";
import type { ReactElement, ReactNode } from "react";

(globalThis as { React?: typeof React }).React = React;

afterEach(() => {
  mock.restoreAll();
  mock.reset();
});

let importId = 0;
async function importDashboardPage(): Promise<{ default: () => Promise<ReactElement> }> {
  importId += 1;
  return import(`@/app/dashboard/page?test=${importId}`) as Promise<{
    default: () => Promise<ReactElement>;
  }>;
}

function stubDashboardComponents(): void {
  const CaseStudyListStub = Object.assign(
    () => React.createElement("div", { "data-testid": "case-study-list-stub" }),
    { displayName: "CaseStudyListStub" },
  );

  const CaseStudyEditorStub = Object.assign(
    () => React.createElement("div", { "data-testid": "case-study-editor-stub" }),
    { displayName: "CaseStudyEditorStub" },
  );

  mock.module("@/components/case-studies/case-study-list", {
    namedExports: {
      CaseStudyList: CaseStudyListStub as unknown as () => ReactElement,
    },
  });

  mock.module("@/components/case-studies/case-study-editor-form", {
    namedExports: {
      CaseStudyEditorShell: CaseStudyEditorStub as unknown as () => ReactElement,
    },
  });

  mock.module("next/link", {
    defaultExport: ({ href, children, ...rest }: { href: string; children?: ReactNode }) =>
      React.createElement("a", { href, ...rest }, children),
  });

  (stubDashboardComponents as unknown as { stubs?: { list: unknown; editor: unknown } }).stubs = {
    list: CaseStudyListStub,
    editor: CaseStudyEditorStub,
  };
}

test("dashboard page redirects unauthenticated users", async () => {
  stubDashboardComponents();

  mock.module("@/lib/auth", {
    namedExports: {
      auth: () => Promise.resolve(null),
    },
  });

  let redirectedTo: string | null = null;
  const redirectError = new Error("redirect");
  mock.module("next/navigation", {
    namedExports: {
      redirect: (href: string) => {
        redirectedTo = href;
        throw redirectError;
      },
    },
  });

  const { default: Page } = await importDashboardPage();

  let thrown: unknown;
  try {
    await Page();
    thrown = null;
  } catch (error) {
    thrown = error;
  }

  assert.equal(thrown, redirectError);
  assert.equal(redirectedTo, "/");
});

test("dashboard page renders overview for authenticated users", async () => {
  stubDashboardComponents();

  const stubs = (stubDashboardComponents as unknown as {
    stubs?: { list: unknown; editor: unknown };
  }).stubs;
  if (!stubs) {
    throw new Error("expected component stubs to be defined");
  }

  mock.module("@/lib/auth", {
    namedExports: {
      auth: () =>
        Promise.resolve({
          user: { id: "user-123" },
        }),
    },
  });

  mock.module("next/navigation", {
    namedExports: {
      redirect: () => {
        throw new Error("redirect should not be called");
      },
    },
  });

  const { default: Page } = await importDashboardPage();
  const element = await Page();

  assert.ok(element && typeof element === "object");
  assert.ok(element?.type === "section");

  function collectTypes(node: unknown, types: unknown[] = []): unknown[] {
    if (!node) {
      return types;
    }

    if (Array.isArray(node)) {
      for (const child of node) {
        collectTypes(child, types);
      }
      return types;
    }

    if (typeof node === "object" && "type" in (node as Record<string, unknown>)) {
      const reactNode = node as { type: unknown; props?: { children?: unknown } };
      types.push(reactNode.type);
      if (reactNode.props && "children" in reactNode.props) {
        collectTypes(reactNode.props.children, types);
      }
    }

    return types;
  }

  const types = collectTypes(element);
  assert.ok(types.includes(stubs.list));
  assert.ok(types.includes(stubs.editor));
});
