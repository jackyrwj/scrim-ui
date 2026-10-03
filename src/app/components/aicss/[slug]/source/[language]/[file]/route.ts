import * as fs from "node:fs";
import * as path from "node:path";
import { aicssComponents } from "@/lib/aicss-catalog";

export const dynamicParams = false;

const languages = ["react", "vue", "svelte"] as const;

export function generateStaticParams() {
  return aicssComponents.flatMap(({ sourceSlug: slug }) =>
    languages.flatMap((language) =>
      fs.readdirSync(path.join(process.cwd(), "src", "aicss-source", language, slug)).map((file) => ({
        slug,
        language,
        file,
      })),
    ),
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; language: string; file: string }> }) {
  const { slug, language, file } = await params;
  if (!aicssComponents.some((component) => component.sourceSlug === slug) || !languages.includes(language as typeof languages[number])) {
    return new Response("Not found", { status: 404 });
  }
  const directory = path.join(process.cwd(), "src", "aicss-source", language, slug);
  if (!fs.readdirSync(directory).includes(file)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(path.join(directory, file)), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
