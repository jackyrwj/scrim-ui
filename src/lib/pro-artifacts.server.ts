/**
 * Server-only access to paid source artifacts.
 *
 * The public repository contains product metadata, but never Pro source. A
 * private repository builds the objects fetched here. Buyer authentication is
 * performed by the route before calling these helpers; this module adds the
 * storage credential that must never reach the browser.
 */

if (typeof window !== "undefined") {
  throw new Error("lib/pro-artifacts.server.ts was imported into client code.");
}

export type ProTemplateSourceFile = { path: string; content: string };

export class ProArtifactError extends Error {
  constructor(
    message: string,
    readonly status = 503,
  ) {
    super(message);
    this.name = "ProArtifactError";
  }
}

function artifactConfig(): { baseUrl: string; token: string } {
  const baseUrl = process.env.PRO_ARTIFACT_BASE_URL?.trim();
  const token = process.env.PRO_ARTIFACT_BEARER_TOKEN?.trim();
  if (!baseUrl || !token) {
    throw new ProArtifactError("Pro downloads are not configured yet.");
  }
  return { baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`, token };
}

async function fetchArtifact(relativePath: string): Promise<Response> {
  const { baseUrl, token } = artifactConfig();
  let url: URL;
  try {
    url = new URL(relativePath, baseUrl);
  } catch {
    throw new ProArtifactError("The Pro artifact origin is misconfigured.");
  }

  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
    redirect: "follow",
  }).catch(() => null);

  if (!response) throw new ProArtifactError("Could not reach the Pro artifact origin.");
  if (response.status === 404) throw new ProArtifactError("Pro source is not available for this item.", 404);
  if (!response.ok) {
    throw new ProArtifactError("The Pro artifact origin rejected the request.", 502);
  }
  return response;
}

export async function readProComponent(slug: string): Promise<string> {
  return (await fetchArtifact(`components/${encodeURIComponent(slug)}.tsx`)).text();
}

export async function readProTemplate(slug: string): Promise<ProTemplateSourceFile[]> {
  const response = await fetchArtifact(`templates/${encodeURIComponent(slug)}.json`);
  const value: unknown = await response.json().catch(() => null);
  const files = (value as { files?: unknown } | null)?.files;
  if (
    !Array.isArray(files) ||
    !files.every(
      (file) =>
        typeof file === "object" &&
        file !== null &&
        typeof (file as { path?: unknown }).path === "string" &&
        typeof (file as { content?: unknown }).content === "string",
    )
  ) {
    throw new ProArtifactError("The Pro template artifact is invalid.", 502);
  }
  return files as ProTemplateSourceFile[];
}

export async function readProTemplateZip(slug: string): Promise<ArrayBuffer> {
  const response = await fetchArtifact(`templates/${encodeURIComponent(slug)}.zip`);
  return response.arrayBuffer();
}

export function proArtifactErrorResponse(error: unknown): Response {
  if (error instanceof ProArtifactError) {
    return Response.json(
      { error: error.message },
      { status: error.status, headers: { "cache-control": "no-store" } },
    );
  }
  console.error("[pro-artifacts] Unexpected artifact error:", error);
  return Response.json(
    { error: "Could not load Pro source." },
    { status: 500, headers: { "cache-control": "no-store" } },
  );
}
