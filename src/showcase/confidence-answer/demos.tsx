"use client";

import * as React from "react";
import { ConfidenceAnswer } from "./confidence-answer";

export function DemoConfidence() {
  return (
    <ConfidenceAnswer
      confidence="medium"
      text="The library's `createStream` helper was deprecated in version 3.2 in favour of `streamText`, which takes the same options object."
      hedge="I may be off by a minor version — check the changelog for the exact release."
    />
  );
}

export function DemoConfidenceHigh() {
  return (
    <ConfidenceAnswer
      confidence="high"
      text="CSS Grid became supported across all major browsers in March 2017."
    />
  );
}

export function DemoConfidenceLow() {
  return (
    <ConfidenceAnswer
      confidence="low"
      text="I believe the conference moved to a November slot, but I don't have a reliable record of it."
      hedge="This is reconstructed from an old announcement and may simply be wrong — verify on the event site before booking anything."
    />
  );
}
