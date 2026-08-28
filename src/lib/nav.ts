/**
 * The site header's navigation, written down once.
 *
 * The desktop bar and the mobile menu each kept their own copy of this list,
 * and the mobile copy silently missed every entry added later — Templates,
 * Icons and Pricing were unreachable below md for exactly that reason. Both
 * renderers read this array now; if a link belongs in the header, it belongs
 * here, not in a component.
 */
export const siteNav = [
  { href: "/tools", label: "Tools" },
  { href: "/components", label: "Components" },
  { href: "/patterns", label: "Patterns" },
  { href: "/templates", label: "Templates" },
  { href: "/icons", label: "Icons" },
  { href: "/resources", label: "Resources" },
  { href: "/inspiration", label: "Inspiration" },
  { href: "/pro", label: "Pricing" },
] as const;
