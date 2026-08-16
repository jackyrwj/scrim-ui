import type { ReactNode } from "react";

export type ComponentVariant = {
  id: string;
  title: string;
  note: string;
  demo: ReactNode;
};

export type ComponentPageConfig = {
  sourceFile: string;
  heroDemo: ReactNode;
  variants: ComponentVariant[];
  usage: string[];
  mistakes: string[];
};
