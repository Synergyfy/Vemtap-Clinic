"use client";

import React from "react";
import { QueueDisplayBoard } from "@/components/queue-display/QueueDisplayBoard";
import { QueueDisplayProvider } from "@/components/queue-display/QueueDisplayContext";

export default function QueueDisplayPage() {
  return (
    <QueueDisplayProvider>
      <QueueDisplayBoard fullScreen />
    </QueueDisplayProvider>
  );
}
