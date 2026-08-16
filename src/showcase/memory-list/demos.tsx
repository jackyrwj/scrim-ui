"use client";

import * as React from "react";
import { MemoryList } from "./memory-list";

const initial = [
  { id: "1", text: "Prefers concise, direct answers over long explanations.", updatedAt: "2d ago" },
  { id: "2", text: "Works at a seed-stage startup building AI products.", updatedAt: "1w ago" },
  { id: "3", text: "Uses VS Code with Vim keybindings.", updatedAt: "3w ago" },
];

export function DemoDefault() {
  const [items, setItems] = React.useState(initial);
  return (
    <MemoryList
      items={items}
      onAdd={(text) =>
        setItems((prev) => [...prev, { id: String(prev.length + 1), text, updatedAt: "just now" }])
      }
      onForget={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
    />
  );
}

export function DemoEmpty() {
  return <MemoryList items={[]} />;
}
