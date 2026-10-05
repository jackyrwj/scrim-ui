"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import { ArtifactPreview, type ArtifactType } from "./artifact-preview";

const CHART_V1 = `export function SalesChart({ data }: { data: number[] }) {
 const max = Math.max(...data);
 return (
 <div className="flex items-end gap-2">
 {data.map((v, i) => (
 <div key={i} style={{ height: (v / max) * 160 }} className="w-10 rounded-t bg-primary" />
 ))}
 </div>
 );
}`;

const CHART_V2 = `export function SalesChart({ data }: { data: number[] }) {
 const max = Math.max(...data);
 const total = data.reduce((a, b) => a + b, 0);
 return (
 <figure>
 <div className="flex items-end gap-2">
 {data.map((v, i) => (
 <div key={i} style={{ height: (v / max) * 160 }} className="w-10 rounded-t bg-primary" />
 ))}
 </div>
 <figcaption>Total: {total.toLocaleString()}</figcaption>
 </figure>
 );
}`;

function ChartMock({ values, caption }: { values: number[]; caption?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 p-6">
      <div className="flex h-40 items-end gap-2">
        {values.map((v, i) => (
          <div
            key={i}
            style={{ height: `${(v / max) * 100}%` }}
            className="w-10 rounded-t-md bg-primary/80"
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{caption ?? "Monthly signups"}</p>
    </div>
  );
}

/** Two versions of a generated chart — page between them, copy the source,
 *  close the panel and bring it back. */
export function DemoDefault() {
  const [versionId, setVersionId] = React.useState("v2");
  const [closed, setClosed] = React.useState(false);

  if (closed) {
    return (
      <Button variant="outline" size="sm"
        type="button"
        onClick={() => setClosed(false)}
        className="rounded-md border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
      >
        Show artifact: signup-chart.tsx
      </Button>
    );
  }

  const v1 = versionId === "v1";
  return (
    <ArtifactPreview
      title="signup-chart.tsx"
      type="chart"
      language="tsx"
      code={v1 ? CHART_V1 : CHART_V2}
      preview={<ChartMock values={v1 ? [3, 5, 4] : [3, 5, 4, 7, 6]} caption={v1 ? undefined : "Total: 25,410"} />}
      versions={[{ id: "v1" }, { id: "v2" }]}
      currentVersionId={versionId}
      onVersionChange={setVersionId}
      onClose={() => setClosed(true)}
    />
  );
}

/** A simple preview mock per artifact type, for the Explorer. */
export function TypeMock({ type }: { type: ArtifactType }) {
  switch (type) {
    case "chart":
      return <ChartMock values={[3, 5, 4, 7, 6]} />;
    case "document":
      return (
        <div className="space-y-2.5 p-6">
          <div className="h-4 w-2/5 rounded bg-muted" />
          <div className="h-2.5 w-full rounded bg-muted" />
          <div className="h-2.5 w-full rounded bg-muted" />
          <div className="h-2.5 w-3/4 rounded bg-muted" />
          <div className="h-2.5 w-5/6 rounded bg-muted" />
        </div>
      );
    case "web":
      return (
        <div className="p-4">
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center gap-1.5 border-b border-border bg-card px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-muted" />
              <span className="h-2 w-2 rounded-full bg-muted" />
              <span className="ml-2 h-3 flex-1 rounded bg-muted" />
            </div>
            <div className="space-y-2 bg-card p-4">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-4/5 rounded bg-muted" />
            </div>
          </div>
        </div>
      );
    case "image":
      return (
        <div className="flex min-h-[240px] items-center justify-center bg-gradient-to-br from-violet-200 via-sky-100 to-emerald-100 p-6 dark:from-violet-900/50 dark:via-sky-900/40 dark:to-emerald-900/40">
          <Badge variant="secondary" className="rounded-full bg-card/70 px-3 py-1 text-xs text-muted-foreground">
            1024 × 1024
          </Badge>
        </div>
      );
    default:
      return (
        <div className="flex min-h-[240px] items-center justify-center p-6 text-xs text-muted-foreground">
          Rendered component preview
        </div>
      );
  }
}
