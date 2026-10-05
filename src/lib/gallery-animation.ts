import { defaultValues, presetValues, type ComponentControls } from "./component-controls";

/** Demo-only state changes; user-controlled explorers keep their own values. */
export function galleryAnimationValues(schema: ComponentControls, elapsed: number) {
  const values = schema.presets[0] ? presetValues(schema, schema.presets[0]) : defaultValues(schema);
  const seconds = elapsed / 1000;
  const working = seconds < 5;
  for (const name of ["defaultOpen", "defaultExpanded", "isStreaming", "planning"]) {
    if (name in values) values[name] = false;
  }
  for (const name of ["status", "state"]) {
    const control = schema.controls.find((control) => control.name === name);
    if (control?.kind !== "enum") continue;
    const options = control.options.map((option) => option.value);
    const active = ["running", "streaming", "generating", "listening"].find((value) => options.includes(value));
    const settled = ["success", "completed", "ready", "idle"].find((value) => options.includes(value));
    if (active && settled) values[name] = working ? active : settled;
  }
  if ("isThinking" in values) values.isThinking = working;
  if ("progress" in values) values.progress = Math.min(100, Math.round(seconds * 20));
  if ("elapsed" in values) values.elapsed = `${Math.min(seconds, 5).toFixed(1)}s`;
  if (schema.tag === "VoiceWaveform") values.state = working ? "listening" : "speaking";
  if (schema.tag === "AgentStatus") values.action = working ? "Searching relevant sources…" : "Found 12 relevant sources";
  if (schema.tag === "Reasoning" || schema.tag === "ReasoningSteps") {
    const steps = String(values.steps).split("\n").filter(Boolean).slice(0, 3);
    values.steps = steps.slice(0, Math.min(3, Math.floor(seconds / 1.6) + 1)).join("\n");
    values.defaultOpen = true;
    values.defaultExpanded = true;
    if ("activeStep" in values) values.activeStep = Math.min(steps.length, Math.floor(seconds / 1.6));
  }
  if (schema.tag === "CodeExecution") {
    values.code = "const sources = await search(query);\nconsole.log(sources.length);";
    values.output = working ? "" : "12 sources collected\nCompleted successfully";
    values.duration = working ? `${seconds.toFixed(1)}s` : "5.0s";
  }
  return values;
}
