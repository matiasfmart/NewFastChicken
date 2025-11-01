"use client";

import React from 'react';
import { FastChickenLogo } from "@/components/icons/FastChickenLogo";
import { Button } from "@/components/ui/button";
import { EndShiftDialog } from './EndShiftDialog';

export function CashierHeader() {
  const [isEndShiftOpen, setEndShiftOpen] = React.useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
        <FastChickenLogo />
        <Button variant="outline" onClick={() => setEndShiftOpen(true)}>Terminar Jornada</Button>
      </header>
      <EndShiftDialog isOpen={isEndShiftOpen} onClose={() => setEndShiftOpen(false)} />
    </>
  );
}
