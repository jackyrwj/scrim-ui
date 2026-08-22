export type MockupDevice = "mobile" | "tablet" | "desktop";

export const DEVICE_WIDTHS: Record<MockupDevice, number> = {
  mobile: 390,
  tablet: 700,
  desktop: 900,
};

export const DEVICE_OPTIONS: { value: MockupDevice; label: string }[] = [
  { value: "mobile", label: "Mobile · 390px" },
  { value: "tablet", label: "Tablet · 700px" },
  { value: "desktop", label: "Desktop · 900px" },
];
