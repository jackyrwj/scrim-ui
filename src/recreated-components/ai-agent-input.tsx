"use client";

import { useRef, useState } from "react";
import { ArrowUp, Paperclip, Sparkles, X } from "lucide-react";

export function AiAgentInput({ onSend }: { onSend?: (message: string, model: string, files: File[]) => void }) {
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("Fast");
  const [files, setFiles] = useState<File[]>([]);
  const [enhancing, setEnhancing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const enhance = () => {
    if (!message.trim() || enhancing) return;
    setEnhancing(true);
    window.setTimeout(() => {
      setMessage((value) => `Please give a clear, step-by-step answer to this request:\n\n${value.trim()}`);
      setEnhancing(false);
    }, 650);
  };
  const send = () => {
    if (!message.trim() && files.length === 0) return;
    onSend?.(message.trim(), model, files);
    setMessage("");
    setFiles([]);
    if (fileInput.current) fileInput.current.value = "";
  };
  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--card) p-3 shadow-sm">
      <label htmlFor="agent-prompt" className="sr-only">Message to agent</label>
      <textarea id="agent-prompt" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} rows={3} placeholder="Ask the agent anything…" className="w-full resize-y bg-transparent px-2 py-1 text-sm leading-6 outline-none placeholder:text-(--muted-foreground) focus-visible:ring-2 focus-visible:ring-(--primary)" />
      {files.length > 0 && <ul className="mt-2 flex flex-wrap gap-2">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center gap-1 rounded-full bg-(--primary-muted) px-2 py-1 text-xs"><span className="max-w-32 truncate">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`} className="rounded-full p-1 focus-visible:outline-2 focus-visible:outline-offset-2"><X size={12} aria-hidden="true" /></button></li>)}</ul>}
      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-(--border) pt-3">
        <input ref={fileInput} type="file" multiple className="sr-only" aria-label="Attach files" onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files ?? [])])} />
        <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs hover:bg-(--primary-muted) focus-visible:outline-2 focus-visible:outline-offset-2"><Paperclip size={14} aria-hidden="true" />Attach</button>
        <label className="flex min-h-9 items-center gap-1.5 text-xs"><span>Model</span><select value={model} onChange={(event) => setModel(event.target.value)} className="rounded-lg border border-(--border) bg-(--card) px-2 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"><option>Fast</option><option>Balanced</option><option>Deep</option></select></label>
        <button type="button" onClick={enhance} disabled={!message.trim() || enhancing} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs hover:bg-(--primary-muted) disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"><Sparkles size={14} aria-hidden="true" />{enhancing ? "Enhancing…" : "Enhance"}</button>
        <button type="button" onClick={send} disabled={!message.trim() && files.length === 0} aria-label="Send message" className="ml-auto flex size-9 items-center justify-center rounded-full bg-(--primary) text-(--primary-foreground) disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"><ArrowUp size={16} aria-hidden="true" /></button>
      </div>
      <p className="sr-only" role="status">{enhancing ? "Enhancing prompt" : ""}</p>
    </div>
  );
}
