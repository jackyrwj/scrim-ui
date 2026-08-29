/* The tool's prompt assembly — shared by the editor page and the /tools
   card demo. Sections in, one combined markdown prompt out: exactly what
   the editor's preview pane and copy button use. */

export type SectionType =
  | "Role"
  | "Rules"
  | "Output Format"
  | "Constraints"
  | "Context"
  | "Examples"
  | "Tone"
  | "Error Handling";

export interface PromptSectionData {
  type: SectionType;
  content: string;
}

export function combineSections(sections: PromptSectionData[]): string {
  return sections
    .filter((s) => s.content.trim())
    .map((s) => `## ${s.type}\n\n${s.content.trim()}`)
    .join("\n\n");
}
