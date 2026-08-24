import type { ReactNode } from "react";
import type { ComponentControls, ControlValues } from "./component-controls";

/**
 * The interactive block at the top of a component page: a prop schema plus the
 * function that turns a set of values into the live element.
 *
 * `render` is supplied by the component's own controls.tsx rather than looked
 * up from a registry, so the component is statically imported and the Explorer
 * itself stays generic.
 */
export type ComponentExplorerConfig = {
  schema: ComponentControls;
  render: (values: ControlValues, remountKey: string) => ReactNode;
};

export type ComponentPageConfig = {
  sourceFile: string;
  heroDemo: ReactNode;
  /**
   * Presets and controls in one surface — the whole of a component page above
   * the source. A preset is what used to be a "variant": a named set of prop
   * values. The snippet is generated from the current values, so the code and
   * the component can no longer disagree.
   */
  explorer: ComponentExplorerConfig;
  usage: string[];
  mistakes: string[];
};
