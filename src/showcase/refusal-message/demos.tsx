"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { RefusalMessage } from "./refusal-message";

export function DemoRefusal() {
  const [accepted, setAccepted] = React.useState(false);
  return accepted ? (
    <Card className="gap-0 py-0 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground">
      To segment a home network, put IoT devices on a guest VLAN so a
      compromised device can’t reach your computers…
      <Button variant="ghost" size="sm"
        type="button"
        onClick={() => setAccepted(false)}
        className="h-auto min-h-8 whitespace-normal justify-start mt-2 block text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Reset demo
      </Button>
    </Card>
  ) : (
    <RefusalMessage
      message="I can't help with gaining access to a network you don't own."
      reason="This falls under unauthorized access — I can only help with networks you administer yourself."
      suggestion="Ask about securing my own home network instead"
      onSuggestion={() => setAccepted(true)}
    />
  );
}

export function DemoRefusalPlain() {
  return (
    <RefusalMessage message="I can't generate a medical diagnosis from a photo." />
  );
}
