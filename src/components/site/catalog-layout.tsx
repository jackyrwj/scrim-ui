import type { ReactNode } from "react";
import { CatalogSidebar, type CatalogGroup } from "./catalog-sidebar";

export function CatalogLayout({ children, groups, href, label, priorityGroup }: {
  children: ReactNode;
  groups: CatalogGroup[];
  href: string;
  label: string;
  priorityGroup?: { slug: string; pathname: string };
}) {
  const sidebar = { groups, href, label, priorityGroup };
  return (
    <div className="mx-auto flex w-full max-w-[1280px] items-start">
      <CatalogSidebar {...sidebar} />
      <div className="catalog-content min-w-0 flex-1">
        <div className="px-5 pt-6 sm:px-8 lg:hidden">
          <CatalogSidebar {...sidebar} mobile />
        </div>
        {children}
      </div>
    </div>
  );
}
