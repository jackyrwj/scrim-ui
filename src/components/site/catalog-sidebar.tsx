"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export type CatalogGroup = {
  slug: string;
  name: string;
  href?: string;
  items: {
    slug: string;
    name: string;
    href?: string;
    status?: "published" | "planned";
    pro?: boolean;
  }[];
};

type CatalogSidebarProps = {
  groups: CatalogGroup[];
  href: string;
  label: string;
  priorityGroup?: { slug: string; pathname: string };
  mobile?: boolean;
};

function CatalogLinks({ groups, href, label, priorityGroup }: CatalogSidebarProps) {
  const pathname = usePathname();
  const orderedGroups = priorityGroup && pathname.startsWith(priorityGroup.pathname)
    ? [...groups.filter((group) => group.slug === priorityGroup.slug), ...groups.filter((group) => group.slug !== priorityGroup.slug)]
    : groups;

  return (
    <nav aria-label={`${label} catalog`} className="space-y-6">
      <Link
        href={href}
        aria-current={pathname === href ? "page" : undefined}
        className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-(--muted) hover:text-(--foreground) ${
          pathname === href ? "bg-(--primary-muted) text-(--foreground)" : "text-(--muted-foreground)"
        }`}
      >
        All {label.toLowerCase()}
      </Link>
      {orderedGroups.map((group) => (
        <section key={group.slug}>
          {group.href ? (
            <Link href={group.href} aria-current={pathname === group.href ? "page" : undefined} className={`mb-2 block rounded-md px-3 py-1 text-xs font-medium transition-colors hover:text-(--foreground) ${pathname === group.href ? "bg-(--primary-muted) text-(--foreground)" : "text-(--muted-foreground)"}`}>
              {group.name}
            </Link>
          ) : (
            <h2 className="mb-2 px-3 text-xs font-medium text-(--muted-foreground)">{group.name}</h2>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const itemHref = item.href ?? `${href}/${item.slug}`;
              const active = pathname === itemHref;
              const content = (
                <>
                  <span className="min-w-0 flex-1 leading-5">{item.name}</span>
                  {item.pro && <span className="shrink-0 text-[10px] font-semibold uppercase">Pro</span>}
                  {item.status === "planned" && <span className="shrink-0 text-[10px]">Soon</span>}
                </>
              );
              return (
                <li key={item.slug}>
                  {item.status !== "planned" ? (
                    <Link
                      href={itemHref}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-9 items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors hover:bg-(--muted) hover:text-(--foreground) ${
                        active ? "bg-(--primary-muted) font-medium text-(--foreground)" : "text-(--muted-foreground)"
                      }`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <span className="flex min-h-9 items-center gap-2 px-3 py-1.5 text-[13px] text-(--muted-foreground) opacity-65">{content}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}

export function CatalogSidebar({ mobile = false, ...props }: CatalogSidebarProps) {
  if (mobile) {
    return (
      <details className="group rounded-lg border border-(--border) bg-(--card)">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium marker:hidden">
          Browse all {props.label.toLowerCase()}
          <ChevronDown size={16} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="max-h-[65dvh] overflow-y-auto border-t border-(--border) px-2 py-4">
          <CatalogLinks {...props} />
        </div>
      </details>
    );
  }

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto px-4 py-10 lg:block">
      <CatalogLinks {...props} />
    </aside>
  );
}
