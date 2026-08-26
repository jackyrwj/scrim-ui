import { SITE_URL } from "./site";
import { displayName, type ComponentEntry } from "./registry";
import type { InspirationEntry } from "./inspiration";

/**
 * Per-page schema.org graphs.
 *
 * The root layout publishes who we are (Organization) and what the site is
 * (WebSite). These say what an individual page *is* — a piece of source code,
 * or an article about building one — and point back at those two nodes by @id
 * so the whole site reads as one graph rather than a pile of strangers.
 *
 * Deliberately absent: datePublished. Nothing in the content model records
 * when an entry was written, and inventing a date is exactly the kind of
 * claim a crawler can catch out. Add the field to the data first, then here.
 */

const ORGANIZATION = { "@id": `${SITE_URL}/#organization` };
const WEBSITE = { "@id": `${SITE_URL}/#website` };

export function componentSchema(entry: ComponentEntry) {
  const url = `${SITE_URL}/components/${entry.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${url}#code`,
    name: displayName(entry),
    description: entry.description,
    url,
    /* The copyable file is TypeScript for React, styled with Tailwind. */
    programmingLanguage: "TypeScript",
    runtimePlatform: "React",
    codeSampleType: "full solution",
    keywords: entry.tags.join(", "),
    license: "https://opensource.org/licenses/MIT",
    inLanguage: "en-US",
    isPartOf: WEBSITE,
    author: ORGANIZATION,
    publisher: ORGANIZATION,
  };
}

export function articleSchema(entry: InspirationEntry) {
  const url = `${SITE_URL}/inspiration/${entry.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: entry.title,
    description: entry.summary,
    url,
    inLanguage: "en-US",
    isPartOf: WEBSITE,
    author: ORGANIZATION,
    publisher: ORGANIZATION,
    /* What the article teaches you to build, linked by the same @id the
       component pages publish, so the two nodes are recognisably one thing. */
    mentions: entry.componentSlugs.map((slug) => ({
      "@type": "SoftwareSourceCode",
      "@id": `${SITE_URL}/components/${slug}#code`,
    })),
  };
}
