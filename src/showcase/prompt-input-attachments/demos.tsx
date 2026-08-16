"use client";

import * as React from "react";
import { PromptInputAttachments, type PendingFile } from "./prompt-input-attachments";

const seq = 3;

export function DemoDefault() {
  const [files, setFiles] = React.useState<PendingFile[]>([
    { id: "1", name: "screenshot.png", size: "1.2 MB", type: "image", status: "done", progress: 100 },
    { id: "2", name: "requirements.pdf", size: "340 KB", type: "file", status: "done", progress: 100 },
  ]);

  const add = () =>
    setFiles((f) => [
      ...f,
      { id: String(Date.now()), name: `notes-${f.length + 1}.md`, size: "8 KB", type: "file", status: "done", progress: 100 },
    ]);

  return (
    <PromptInputAttachments
      files={files}
      onAttach={add}
      onRemove={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
      onSubmit={() => {}}
    />
  );
}

export function DemoUploading() {
  const [files, setFiles] = React.useState<PendingFile[]>([
    { id: "u1", name: "research.pdf", size: "8.1 MB", type: "file", status: "uploading", progress: 64 },
    { id: "u2", name: "demo.webm", size: "24 MB", type: "file", status: "uploading", progress: 12 },
  ]);

  React.useEffect(() => {
    const t = window.setInterval(() => {
      setFiles((fs) =>
        fs.map((f) =>
          f.status === "uploading" && f.progress !== undefined
            ? { ...f, progress: Math.min(100, f.progress + 4) }
            : f,
        ),
      );
    }, 500);
    return () => window.clearInterval(t);
  }, []);

  return (
    <PromptInputAttachments
      files={files}
      onAttach={() => {}}
      onRemove={() => {}}
      onSubmit={() => {}}
    />
  );
}

export function DemoError() {
  const [files, setFiles] = React.useState<PendingFile[]>([
    { id: "e1", name: "archive.zip", size: "120 MB", type: "file", status: "error" },
    { id: "e2", name: "designs.fig", size: "4.2 MB", type: "file", status: "done", progress: 100 },
  ]);

  return (
    <PromptInputAttachments
      files={files}
      onAttach={() => {}}
      onRemove={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
      onRetry={(id) =>
        setFiles((fs) =>
          fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 8 } : f)),
        )
      }
      onSubmit={() => {}}
    />
  );
}

export function DemoLive() {
  const [files, setFiles] = React.useState<PendingFile[]>([]);

  const addRandom = () => {
    const isImage = Math.random() > 0.5;
    const name = isImage ? `photo-${seq}.png` : `document-${seq}.pdf`;
    const size = isImage ? `${(Math.random() * 3 + 0.4).toFixed(1)} MB` : `${Math.round(Math.random() * 200 + 20)} KB`;
    const file: PendingFile = {
      id: String(Date.now()),
      name,
      size,
      type: isImage ? "image" : "file",
      status: "uploading",
      progress: 0,
    };
    setFiles((f) => [...f, file]);
    const t = window.setInterval(() => {
      setFiles((fs) =>
        fs.map((x) =>
          x.id === file.id && x.status === "uploading" && x.progress !== undefined
            ? x.progress >= 100
              ? { ...x, status: "done", progress: 100 }
              : { ...x, progress: Math.min(100, x.progress + Math.ceil(Math.random() * 18)) }
            : x,
        ),
      );
    }, 400);
    window.setTimeout(() => window.clearInterval(t), 6000);
  };

  return (
    <PromptInputAttachments
      files={files}
      onAttach={addRandom}
      onRemove={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
      onRetry={(id) =>
        setFiles((fs) =>
          fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 4 } : f)),
        )
      }
      onSubmit={() => {}}
    />
  );
}
