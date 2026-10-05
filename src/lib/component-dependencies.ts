/** Only installed shadcn primitives may cross the showcase source boundary. */
export const shadcnPrimitives = ["button", "input", "textarea", "badge", "card", "skeleton"] as const;

export function componentDependencies(source: string): string[] {
  const dependencies = new Set<string>();
  for (const match of source.matchAll(/from ["']([^"']+)["']/g)) {
    const specifier = match[1];
    if (specifier === "react") continue;
    const primitive = specifier.replace("@/components/ui/", "");
    if (specifier.startsWith("@/components/ui/") && shadcnPrimitives.some((name) => name === primitive)) {
      dependencies.add(primitive);
      continue;
    }
    throw new Error(`Undeclared component import: ${specifier}`);
  }
  return [...dependencies].sort();
}
