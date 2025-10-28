import { type ReactElement, type ReactNode } from "react";

import { type CaseStudyDetail } from "@/lib/validators/case-study";

export interface CaseStudyDetailContentProps {
  readonly caseStudy: CaseStudyDetail;
  readonly assetAction?: (asset: CaseStudyDetail["assets"][number]) => ReactNode;
}

export function CaseStudyDetailContent({
  caseStudy,
  assetAction,
}: CaseStudyDetailContentProps): ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{caseStudy.title}</h2>
        <p className="text-sm text-muted-foreground">Slug: {caseStudy.slug}</p>
        {caseStudy.audience ? <p className="text-sm text-muted-foreground">Audience: {caseStudy.audience}</p> : null}
        {caseStudy.headline ? <p className="text-base text-foreground">{caseStudy.headline}</p> : null}
        {caseStudy.summary ? <p className="text-sm text-muted-foreground">{caseStudy.summary}</p> : null}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Sections</h3>
        {caseStudy.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sections added yet.</p>
        ) : (
          <div className="space-y-4">
            {caseStudy.sections.map((section) => (
              <article key={section.id} className="rounded-md border border-border p-4 shadow-sm">
                <h4 className="text-base font-semibold text-foreground">{section.title}</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{section.content}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Media attachments</h3>
        {caseStudy.assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {caseStudy.assets.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded border border-border px-3 py-2"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-foreground">
                    <span className="font-medium">{asset.name}</span>
                    {caseStudy.heroAssetId === asset.id ? (
                      <span className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">Hero</span>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {asset.mimeType} • {Math.round(asset.size / 1024)} KB
                  </span>
                </div>
                {assetAction ? <div className="text-xs">{assetAction(asset)}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
