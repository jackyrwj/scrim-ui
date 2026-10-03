"use client";

import { useState } from "react";
import { Check, ChevronDown, Circle, LoaderCircle } from "lucide-react";

type TaskState = "done" | "active" | "pending";
const initial: { title: string; state: TaskState }[] = [
  { title: "Inspect the project structure", state: "done" },
  { title: "Build the component", state: "active" },
  { title: "Run checks and review", state: "pending" },
];
export function AgentTaskList() {
  const [tasks, setTasks] = useState(initial);
  const [open, setOpen] = useState(true);
  const completed = tasks.filter((task) => task.state === "done").length;
  const advance = (index: number) => setTasks((current) => current.map((task, i) => i === index ? { ...task, state: task.state === "pending" ? "active" : task.state === "active" ? "done" : "pending" } : task));
  return <div className="w-full overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm"><button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"><span>Agent tasks <span className="ml-2 text-xs font-normal text-(--muted-foreground)">{completed}/{tasks.length} done</span></span><ChevronDown size={16} aria-hidden="true" className={open ? "rotate-180" : ""} /></button>{open && <ol className="border-t border-(--border) px-4 py-3">{tasks.map((task, index) => <li key={task.title}><button type="button" onClick={() => advance(index)} aria-label={`${task.title}, ${task.state}. Change status`} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-2 text-left text-xs hover:bg-(--primary-muted) focus-visible:outline-2 focus-visible:outline-offset-2">{task.state === "done" ? <Check size={16} className="text-emerald-600" aria-hidden="true" /> : task.state === "active" ? <LoaderCircle size={16} className="text-(--primary)" aria-hidden="true" /> : <Circle size={16} className="text-(--muted-foreground)" aria-hidden="true" />}<span className={task.state === "done" ? "text-(--muted-foreground) line-through" : ""}>{task.title}</span><span className="ml-auto capitalize text-(--muted-foreground)">{task.state}</span></button></li>)}</ol>}</div>;
}
