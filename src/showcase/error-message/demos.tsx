"use client";

import * as React from "react";
import { ErrorMessage } from "./error-message";

export function DemoError() {
  const [failed, setFailed] = React.useState(true);
  return failed ? (
    <ErrorMessage
      message="The request timed out while the model was generating. Your message was saved, so you can retry without retyping."
      onRetry={() => setFailed(false)}
    />
  ) : (
    <ErrorMessage
      message="Retry succeeded — here’s the answer that was generating when the request timed out."
      severity="warning"
    />
  );
}

export function DemoRetrying() {
  return (
    <ErrorMessage
      message="The connection was interrupted. Retrying the same request with your message intact."
      onRetry={() => {}}
      retrying
    />
  );
}

export function DemoRateLimit() {
  const [countdown, setCountdown] = React.useState(12);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearInterval(t);
  }, [countdown]);

  return (
    <ErrorMessage
      severity="rate-limit"
      message="You’ve reached the request limit for this conversation. It resets shortly — no action needed."
      onRetry={() => {}}
      retryCountdown={countdown}
    />
  );
}
