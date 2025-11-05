'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateRangeSelectorProps {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps) {
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);
  const [tempFrom, setTempFrom] = useState<Date | undefined>();
  const [tempTo, setTempTo] = useState<Date | undefined>();

  // Helper para setear a "Hoy"
  const setToday = () => {
    const today = new Date();
    onDateRangeChange({
      from: startOfDay(today),
      to: endOfDay(today)
    });
  };

  // Verificar si es "Hoy"
  const isToday = () => {
    const today = new Date();
    const todayStart = startOfDay(today).getTime();
    const todayEnd = endOfDay(today).getTime();
    return dateRange.from.getTime() === todayStart && dateRange.to.getTime() === todayEnd;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (isSelectingFrom) {
      setTempFrom(date);
      setIsSelectingFrom(false);
    } else {
      setTempTo(date);
      if (tempFrom) {
        // Asegurar que 'from' sea menor que 'to'
        const from = tempFrom < date ? tempFrom : date;
        const to = tempFrom < date ? date : tempFrom;

        onDateRangeChange({
          from: startOfDay(from),
          to: endOfDay(to)
        });

        // Resetear estado temporal
        setTempFrom(undefined);
        setTempTo(undefined);
        setIsSelectingFrom(true);
      }
    }
  };

  const getCustomLabel = () => {
    if (!isToday()) {
      return `${format(dateRange.from, 'dd/MM', { locale: es })} - ${format(dateRange.to, 'dd/MM', { locale: es })}`;
    }
    return 'Seleccionar rango';
  };

  return (
    <div className="flex items-center gap-2">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1 border rounded-md p-1">
        {/* Botón "Hoy" */}
        <Button
          variant={isToday() ? 'default' : 'ghost'}
          size="sm"
          onClick={setToday}
          className="h-8"
        >
          Hoy
        </Button>

        {/* Botón de rango personalizado */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={!isToday() ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
            >
              {getCustomLabel()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3 border-b">
              <p className="text-sm font-medium">
                {isSelectingFrom ? 'Selecciona fecha de inicio' : 'Selecciona fecha de fin'}
              </p>
              {tempFrom && !isSelectingFrom && (
                <p className="text-xs text-muted-foreground mt-1">
                  Desde: {format(tempFrom, "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              )}
            </div>
            <Calendar
              mode="single"
              selected={isSelectingFrom ? tempFrom : tempTo}
              onSelect={handleDateSelect}
              initialFocus
              locale={es}
            />
            {tempFrom && !isSelectingFrom && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setTempFrom(undefined);
                    setTempTo(undefined);
                    setIsSelectingFrom(true);
                  }}
                >
                  Reiniciar selección
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
