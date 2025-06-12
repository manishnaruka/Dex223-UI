"use client";

import React from "react";

import Button, { ButtonColor } from "@/components/buttons/Button";

export default function DebugRequestsPage() {
  return (
    <>
      <div className="grid gap-2">
        <Button colorScheme={ButtonColor.PURPLE}>Click me</Button>
        <Button colorScheme={ButtonColor.LIGHT_PURPLE}>Click me</Button>
      </div>
    </>
  );
}
