"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { FileUpload } from "../../file-upload/file-upload";
import { AgentStatus, type AgentState } from "../../agent-status/agent-status";
import { InlineCorrection } from "../../inline-correction/inline-correction";

/**
 * Structured extraction with a human review pass.
 *
 * The workflow this pattern exists to show:
 *
 * 1. **Fields land progressively.** The table renders the moment extraction
 *    starts; pending rows are honest placeholders, not a spinner over a
 *    blank page.
 * 2. **Confidence is per field, and it badges the risk — not the solid
 *    values.** High-confidence fields stay quiet; medium and low get the
 *    amber/red treatment borrowed from Confidence Answer, with the specific
 *    reason ("smudged in scan", "ambiguous date format").
 * 3. **A correction never destroys the extracted value.** The original
 *    stays visible under the human value — the audit trail is the point of
 *    the review pass.
 * 4. **Validation happens at the field, on the human's edit.** A bad value
 *    blocks that row, not the whole document.
 * 5. **Export is earned.** The button stays disabled until every flagged
 *    field is confirmed or corrected — "ready to export" is a state the
 *    interface computes, not a hope.
 *
 * Boundary with the Pro structured-extraction template: no schema-driven
 * generation, no partial-object streaming — mock state, scripted fill.
 */

/* ------------------------------------------------------------------ */
/* Field model                                                         */
/* ------------------------------------------------------------------ */

type Confidence = "high" | "medium" | "low";

type Field = {
  id: string;
  label: string;
  /** Extracted value. Undefined while extraction hasn't reached this row. */
  value?: string;
  confidence?: Confidence;
  /** The specific thing to check — shown for medium/low, like a hedge. */
  note?: string;
  /** The human's correction. The extracted value is never mutated. */
  corrected?: string;
  error?: string;
  validate?: (v: string) => string | undefined;
};

const INITIAL_FIELDS: Field[] = [
  { id: "number", label: "Invoice number" },
  { id: "vendor", label: "Vendor" },
  { id: "issued", label: "Issue date" },
  { id: "due", label: "Due date" },
  { id: "taxid", label: "Tax ID" },
  {
    id: "total",
    label: "Total due",
    validate: (v) => {
      const n = Number(v.replace(/[,$\s]/g, ""));
      if (Number.isNaN(n) || v.trim() === "") return "Enter a numeric amount, e.g. 1475.60";
      if (n <= 0) return "Amount must be greater than zero";
      return undefined;
    },
  },
];

const EXTRACTED: Record<string, { value: string; confidence: Confidence; note?: string }> = {
  number: { value: "INV-1042", confidence: "high" },
  vendor: { value: "Acme Office Supplies", confidence: "high" },
  issued: { value: "2026-08-14", confidence: "high" },
  due: { value: "2026-09-13", confidence: "medium", note: "Date was printed as 08/09 — day/month order is ambiguous." },
  taxid: { value: "DE 3141 5926", confidence: "low", note: "Smudged in the scan — two digits uncertain." },
  total: { value: "1,475.60", confidence: "high" },
};

const TERMS_TEXT = "Net 30. Late payments accrue 1.5% monthly interest.";

const CONFIDENCE_STYLES: Record<"medium" | "low", { label: string; dot: string; text: string }> = {
  medium: { label: "Double-check", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  low: { label: "Treat as a guess", dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
};

/* ------------------------------------------------------------------ */
/* Pattern                                                             */
/* ------------------------------------------------------------------ */

export function ExtractionReviewPattern() {
  const [fields, setFields] = React.useState<Field[]>(INITIAL_FIELDS);
  const [runState, setRunState] = React.useState<AgentState | "idle">("idle");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [confirmed, setConfirmed] = React.useState<string[]>([]);
  const [termsCorrection, setTermsCorrection] = React.useState<string | undefined>();
  const [exported, setExported] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  const filledCount = fields.filter((f) => f.value !== undefined).length;
  const flagged = fields.filter(
    (f) => f.value !== undefined && f.confidence !== "high" && !f.corrected && !confirmed.includes(f.id),
  );
  const errors = fields.filter((f) => f.error);
  const readyToExport = runState === "completed" && flagged.length === 0 && errors.length === 0;
  const correctedCount = fields.filter((f) => f.corrected).length + (termsCorrection ? 1 : 0);

  function runExtraction() {
    setRunState("running");
    setFields(INITIAL_FIELDS);
    setConfirmed([]);
    setExported(false);
    let i = 0;
    const ids = INITIAL_FIELDS.map((f) => f.id);
    timerRef.current = window.setInterval(() => {
      const id = ids[i];
      const e = EXTRACTED[id];
      setFields((fs) => fs.map((f) => (f.id === id ? { ...f, value: e.value, confidence: e.confidence, note: e.note } : f)));
      i += 1;
      if (i >= ids.length) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setRunState("completed");
      }
    }, 550);
  }

  function startEdit(field: Field) {
    setEditingId(field.id);
    setDraft(field.corrected ?? field.value ?? "");
  }

  function commitEdit(field: Field) {
    const v = draft.trim();
    if (!v) {
      setEditingId(null);
      return;
    }
    const error = field.validate?.(v);
    if (error) {
      setFields((fs) => fs.map((f) => (f.id === field.id ? { ...f, error } : f)));
      return;
    }
    setFields((fs) => fs.map((f) => (f.id === field.id ? { ...f, corrected: v, error: undefined } : f)));
    setEditingId(null);
  }

  return (
    <Card className="flex-row gap-0 py-0 flex h-[640px] overflow-hidden rounded-xl border border-border bg-card">
      {/* Documents rail */}
      <aside className="hidden w-56 shrink-0 flex-col gap-3 overflow-y-auto border-r border-border p-3 md:flex">
        <p className="text-sm font-semibold text-foreground">Documents</p>
        <FileUpload status="idle" accept=".pdf,.png,.jpg" onSelect={() => {}} />
        <ul className="space-y-1">
          <li className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-2">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              invoice-1042.pdf
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">1 page</span>
          </li>
        </ul>
      </aside>

      {/* Review table */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Extraction Review</p>
          <p className="truncate text-xs text-muted-foreground">
            Fields land as they&apos;re read — confirm or correct the flagged ones
          </p>
        </div>

        <div className="border-b border-border px-4 py-3">
          <AgentStatus
            name="Extractor"
            status={runState === "idle" ? "waiting" : runState}
            action={
              runState === "idle"
                ? "Ready — run extraction on invoice-1042.pdf"
                : runState === "running"
                  ? `Reading invoice-1042.pdf… ${filledCount} of ${fields.length} fields`
                  : runState === "completed"
                    ? `Extracted ${fields.length} fields — ${flagged.length} need review`
                    : "Extraction failed"
            }
          />
          {runState === "idle" && (
            <Button variant="default" size="sm"
              type="button"
              onClick={runExtraction}
              className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary"
            >
              Run extraction
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <ul className="divide-y divide-border">
            {fields.map((f) => {
              const displayValue = f.corrected ?? f.value;
              const needsReview = f.value !== undefined && f.confidence !== "high" && !f.corrected && !confirmed.includes(f.id);
              const style = f.confidence && f.confidence !== "high" ? CONFIDENCE_STYLES[f.confidence] : null;
              return (
                <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">{f.label}</span>

                  {f.value === undefined ? (
                    <span className="h-4 w-24 animate-pulse rounded bg-muted" aria-label="Extracting…" />
                  ) : editingId === f.id ? (
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <Input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit(f);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        aria-label={`Correct ${f.label}`}
                        className="w-44 rounded-md border border-border bg-card px-2 py-1 text-base sm:text-sm text-foreground outline-none focus:border-border"
                      />
                      <Button variant="default" size="sm"
                        type="button"
                        onClick={() => commitEdit(f)}
                        className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                      >
                        Save
                      </Button>
                      <Button variant="ghost" size="sm"
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                    </span>
                  ) : (
                    <span className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground">{displayValue}</span>
                      {f.corrected && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          was: <s>{f.value}</s>
                        </span>
                      )}
                    </span>
                  )}

                  {f.value !== undefined && editingId !== f.id && (
                    <span className="flex shrink-0 items-center gap-2">
                      {needsReview && style && (
                        <>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${style.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                          <Button variant="outline" size="sm"
                            type="button"
                            onClick={() => setConfirmed((c) => [...c, f.id])}
                            className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            Confirm
                          </Button>
                        </>
                      )}
                      {(f.corrected || confirmed.includes(f.id)) && (
                        <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                          {f.corrected ? "Corrected" : "Confirmed"}
                        </span>
                      )}
                      <Button variant="outline" size="sm"
                        type="button"
                        onClick={() => startEdit(f)}
                        className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                      >
                        Edit
                      </Button>
                    </span>
                  )}

                  {(f.error || (needsReview && f.note)) && (
                    <span className="w-full pl-28">
                      {f.error ? (
                        <span role="alert" className="text-xs text-red-600 dark:text-red-400">{f.error}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{f.note}</span>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          {runState === "completed" && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Payment terms (free text)</p>
              <InlineCorrection
                text={TERMS_TEXT}
                correction={termsCorrection}
                correctedBy="you"
                onSubmit={(v) => setTermsCorrection(v)}
                onRevert={() => setTermsCorrection(undefined)}
              />
            </div>
          )}
        </div>

        {/* Export footer — earned, not assumed */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {runState === "completed"
              ? readyToExport
                ? `${fields.length} fields · ${correctedCount} corrected · ready to export`
                : `${flagged.length} flagged · ${errors.length} invalid — resolve before export`
              : "Run extraction to begin review"}
          </p>
          <Button variant="default" size="sm"
            type="button"
            disabled={!readyToExport || exported}
            onClick={() => setExported(true)}
            className="rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors enabled:hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exported ? "Exported ✓" : "Export JSON"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
