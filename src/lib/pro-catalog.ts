import catalog from "./pro-catalog.json";

export type ProComponentCatalogEntry = {
  sourceFile: string;
  lines: number;
  usage: string[];
  mistakes: string[];
};

export type ProTemplateFile = {
  path: string;
  lines: number;
};

export type ProTemplateCatalogEntry = {
  files: ProTemplateFile[];
};

const components = catalog.components as Record<string, ProComponentCatalogEntry>;
const templates = catalog.templates as Record<string, ProTemplateCatalogEntry>;

export function getProComponentCatalog(slug: string): ProComponentCatalogEntry | undefined {
  return components[slug];
}

export function getProTemplateCatalog(slug: string): ProTemplateCatalogEntry | undefined {
  return templates[slug];
}
