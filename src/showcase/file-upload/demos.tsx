"use client";

import * as React from "react";
import { FileUpload } from "./file-upload";

export function DemoIdle() {
  return <FileUpload status="idle" onSelect={() => {}} />;
}

export function DemoUploading() {
  const [progress, setProgress] = React.useState(8);

  React.useEffect(() => {
    const t = window.setInterval(() => {
      setProgress((p) => (p >= 96 ? 96 : p + Math.ceil(Math.random() * 12)));
    }, 400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <FileUpload status="uploading" progress={progress} fileName="report.pdf" fileSize="2.4 MB" />
  );
}

export function DemoDone() {
  return (
    <FileUpload
      status="done"
      progress={100}
      fileName="report.pdf"
      fileSize="2.4 MB"
      onRemove={() => {}}
    />
  );
}

export function DemoError() {
  return (
    <FileUpload
      status="error"
      progress={100}
      fileName="report.pdf"
      fileSize="2.4 MB"
      onRetry={() => {}}
      onRemove={() => {}}
    />
  );
}
