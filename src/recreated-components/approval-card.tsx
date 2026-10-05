"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";

type ApprovalMode = "command" | "clarification" | "plan";
export function ApprovalCard({ onDecision }: { onDecision?: (decision: "approved" | "denied", answers?: string[]) => void }) {
  const [mode, setMode] = useState<ApprovalMode>("command");
  const [decision, setDecision] = useState<"approved" | "denied" | null>(null);
  const [answers, setAnswers] = useState(["", "", ""]);
  const questions = ["Which environment should I use?", "Should I keep the existing data?", "When should I run this?"];
  const decide = (value: "approved" | "denied") => { setDecision(value); onDecision?.(value, mode === "clarification" ? answers : undefined); };
  return <Card className="gap-0 py-0 w-full rounded-xl border border-border bg-card p-5 shadow-sm">
    <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted"><ShieldCheck size={18} aria-hidden="true" /></span><div><h3 className="text-sm font-semibold">Agent needs your input</h3><p className="mt-1 text-xs text-muted-foreground">Review the request before the agent continues.</p></div></div>
    <div className="mt-4 flex flex-wrap gap-1" role="group" aria-label="Request type">{(["command", "clarification", "plan"] as const).map((item) => <Button variant="ghost" size="sm" type="button" key={item} aria-pressed={mode === item} onClick={() => { setMode(item); setDecision(null); }} className={`min-h-9 rounded-md px-3 text-xs capitalize focus-visible:outline-2 focus-visible:outline-offset-2 ${mode === item ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted"}`}>{item}</Button>)}</div>
    <div className="mt-4 rounded-xl bg-muted p-4 text-sm">{mode === "command" ? <><p className="font-medium">Run project checks?</p><pre className="mt-2 overflow-x-auto rounded-md bg-card p-3 text-xs">npm run build</pre></> : mode === "plan" ? <><p className="font-medium">Proposed plan</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-6"><li>Inspect current files</li><li>Apply the changes</li><li>Run checks and report results</li></ol></> : <div className="space-y-3">{questions.map((question, index) => <label key={question} className="block text-xs"><span className="mb-1 block font-medium">{question}</span><Input value={answers[index]} onChange={(event) => setAnswers((current) => current.map((answer, i) => i === index ? event.target.value : answer))} className="min-h-9 w-full rounded-md border border-border bg-card px-3 outline-none focus-visible:ring-2 focus-visible:ring-primary" /></label>)}</div>}</div>
    {decision ? <p role="status" className="mt-4 flex items-center gap-2 text-sm">{decision === "approved" ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}{decision === "approved" ? "Approved" : "Denied"}</p> : <div className="mt-4 flex gap-2"><Button variant="default" size="sm" type="button" onClick={() => decide("approved")} className="min-h-10 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2">{mode === "clarification" ? "Send answers" : "Approve"}</Button><Button variant="outline" size="sm" type="button" onClick={() => decide("denied")} className="min-h-10 rounded-md border border-border px-4 text-xs focus-visible:outline-2 focus-visible:outline-offset-2">Deny</Button></div>}
  </Card>;
}
