import type { ReactNode } from "react";

export type PatternElement = {
  label: string;
  componentSlug?: string;
};

export type PatternPageConfig = {
  sourceFile: string;
  heroDemo: ReactNode;
  elements: PatternElement[];
  usage: string[];
  mistakes: string[];
};
