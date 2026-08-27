"use client";

import * as React from "react";
import { ResponseRating, type Rating } from "./response-rating";

function Answer({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 max-w-lg text-[15px] leading-7 text-zinc-700 dark:text-zinc-200">{children}</p>
  );
}

/* Held locally here because a demo has no server. In a real app `rating` is
   what came back from one — the click is a request, not a state change. */
export function DemoDefault() {
  const [rating, setRating] = React.useState<Rating | undefined>(undefined);
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div>
      <Answer>
        Chunk overlap mostly buys you robustness at boundaries — a sentence split across two chunks
        is retrievable from either. Past about 20% it stops helping and starts inflating your
        embedding bill.
      </Answer>
      <ResponseRating
        rating={rating}
        submitted={submitted}
        onRate={(next) => {
          setRating(next);
          setSubmitted(false);
        }}
        onSubmitDetail={() => setSubmitted(true)}
      />
    </div>
  );
}

export function DemoIdle() {
  return <ResponseRating />;
}

export function DemoUp() {
  return <ResponseRating rating="up" />;
}

export function DemoReasons() {
  return <ResponseRating rating="down" />;
}

export function DemoSubmitted() {
  return <ResponseRating rating="down" submitted />;
}

export function DemoCompact() {
  return <ResponseRating rating="up" compact />;
}
