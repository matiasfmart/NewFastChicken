"use client";

import React from 'react';
import { FastChickenLogo } from "@/components/icons/FastChickenLogo";
import { Button } from "@/components/ui/button";
import { EndShiftDialog } from './EndShiftDialog';
import { StartShiftDialog } from './StartShiftDialog';
import { useShift } from '@/context/ShiftContext';
import { User, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export function CashierHeader() {
  const { currentShift } = useShift();
  const [isEndShiftOpen, setEndShiftOpen] = React.useState(false);
  const [isStartShiftOpen, setStartShiftOpen] = React.useState(false);
  const [elapsedTime, setElapsedTime] = React.useState("");

  // Calcular tiempo transcurrido
  React.useEffect(() => {
    if (!currentShift || currentShift.status !== 'open') return;

    const updateElapsedTime = () => {
      const now = new Date();
      let start: Date;

      if (currentShift.startedAt instanceof Date) {
        start = currentShift.startedAt;
      } else if (currentShift.startedAt instanceof Timestamp) {
        start = currentShift.startedAt.toDate();
      } else {
        start = new Date(currentShift.startedAt);
      }

      const diffMs = now.getTime() - start.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setElapsedTime(`${hours}h ${minutes}m`);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [currentShift]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
        <FastChickenLogo />

        {currentShift && currentShift.status === 'open' ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{currentShift.employeeName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{elapsedTime}</span>
              </div>
              <div className="text-muted-foreground">
                • ${currentShift.totalRevenue.toLocaleString('es-AR')}
              </div>
            </div>
            <Button variant="outline" onClick={() => setEndShiftOpen(true)}>
              Terminar Jornada
            </Button>
          </div>
        ) : (
          <Button onClick={() => setStartShiftOpen(true)}>
            Iniciar Jornada
          </Button>
        )}
      </header>

      <StartShiftDialog
        isOpen={isStartShiftOpen}
        onClose={() => setStartShiftOpen(false)}
      />
      <EndShiftDialog
        isOpen={isEndShiftOpen}
        onClose={() => setEndShiftOpen(false)}
      />
    </>
  );
}
