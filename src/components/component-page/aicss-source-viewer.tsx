"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { CodeBlock } from "./code-block";

export type AicssSourceGroup = {
  language: "react" | "vue" | "svelte";
  files: { name: string; code: string; url: string }[];
};

export function AicssSourceViewer({ groups }: { groups: AicssSourceGroup[] }) {
  const [language, setLanguage] = useState<AicssSourceGroup["language"]>("react");
  const [fileIndex, setFileIndex] = useState(0);
  const group = groups.find((entry) => entry.language === language)!;
  const file = group.files[fileIndex] ?? group.files[0];
  return (
    <section id="source" className="mt-10 scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-medium">Code</h2>
        <div className="flex rounded-full bg-(--primary-muted) p-1" role="group" aria-label="Source framework">
          {groups.map((entry) => <button key={entry.language} type="button" aria-pressed={entry.language === language} onClick={() => { setLanguage(entry.language); setFileIndex(0); }} className={`min-h-7 rounded-full px-3 text-xs capitalize transition-colors ${entry.language === language ? "bg-(--card) text-(--foreground) shadow-sm" : "text-(--muted-foreground)"}`}>{entry.language === "react" ? "React" : entry.language === "vue" ? "Vue" : "Svelte"}</button>)}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Source file">
          {group.files.map((entry, index) => <button key={entry.name} type="button" aria-pressed={entry.name === file.name} onClick={() => setFileIndex(index)} className={`rounded-md px-2.5 py-2 font-mono text-xs transition-colors ${entry.name === file.name ? "bg-(--primary-muted) text-(--foreground)" : "text-(--muted-foreground) hover:text-(--foreground)"}`}>{entry.name}</button>)}
        </div>
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-(--muted-foreground) transition-colors hover:bg-(--primary-muted) hover:text-(--foreground)"><Download size={13} aria-hidden="true" />Open source ↗</a>
      </div>
      <CodeBlock key={`${language}-${file.name}`} filename={file.name} code={file.code} maxLines={18} />
      <p className="mt-3 text-xs leading-6 text-(--muted-foreground)">{language === "react" ? "Copy both the component and its CSS Module into the same folder." : "Copy this component into your project. Its styles are included in the file."}</p>
    </section>
  );
}
