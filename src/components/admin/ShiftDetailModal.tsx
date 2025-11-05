"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShiftAPI, OrderAPI } from '@/api';
import type { Shift, Order } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, Package, TrendingUp, Clock, User, Calendar, AlertCircle } from 'lucide-react';

interface ShiftDetailModalProps {
  shiftId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftDetailModal({ shiftId, isOpen, onClose }: ShiftDetailModalProps) {
  const [shift, setShift] = useState<Shift | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (shiftId && isOpen) {
      fetchShiftDetails();
    }
  }, [shiftId, isOpen]);

  const fetchShiftDetails = async () => {
    if (!shiftId) return;

    setIsLoading(true);
    try {
      const [shiftData, ordersData] = await Promise.all([
        ShiftAPI.getById(shiftId),
        OrderAPI.getByShiftId(shiftId)
      ]);
      setShift(shiftData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch shift details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date: Date | any) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date as any);
      if (isNaN(dateObj.getTime())) return 'Fecha inválida';
      return format(dateObj, "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatTime = (date: Date | any) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date as any);
      if (isNaN(dateObj.getTime())) return '--:--';
      return format(dateObj, 'HH:mm', { locale: es });
    } catch {
      return '--:--';
    }
  };

  const calculateDuration = (startedAt: Date | any, endedAt?: Date | any) => {
    try {
      const start = startedAt instanceof Date ? startedAt : new Date(startedAt as any);
      const end = endedAt ? (endedAt instanceof Date ? endedAt : new Date(endedAt as any)) : new Date();
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '0h 0m';
      const diffMs = end.getTime() - start.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return '0h 0m';
    }
  };

  // Calcular métricas
  const totalOrders = orders.length;
  const avgTicket = shift && totalOrders > 0 ? shift.totalRevenue / totalOrders : 0;

  // Agrupar por combo
  const comboSales = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      const comboName = item.combo?.name || 'Sin nombre';
      if (!acc[comboName]) {
        acc[comboName] = { qty: 0, total: 0 };
      }
      acc[comboName].qty += item.quantity;
      acc[comboName].total += item.quantity * item.finalUnitPrice;
    });
    return acc;
  }, {} as Record<string, { qty: number; total: number }>);

  const expectedCash = shift ? shift.initialCash + shift.totalRevenue : 0;
  const hasDifference = shift?.cashDifference !== undefined && shift?.cashDifference !== 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isLoading ? (
              'Cargando detalles...'
            ) : shift ? (
              <>
                <User className="h-6 w-6" />
                {shift.employeeName}
              </>
            ) : (
              'Detalle de jornada'
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : shift ? (
          <div className="space-y-6">
            {/* Info adicional del header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(shift.startedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(shift.startedAt)} - {shift.endedAt ? formatTime(shift.endedAt) : 'Activa'}
                </span>
                <span className="text-sm">({calculateDuration(shift.startedAt, shift.endedAt)})</span>
              </div>
              <Badge variant={shift.status === 'open' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                {shift.status === 'open' ? 'Abierta' : 'Cerrada'}
              </Badge>
            </div>

            {/* Resumen Financiero */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fondo inicial</p>
                    <p className="text-xl font-bold">{formatCurrency(shift.initialCash)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total ventas</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(shift.totalRevenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Efectivo esperado</p>
                    <p className="text-xl font-bold">{formatCurrency(expectedCash)}</p>
                  </div>
                  {shift.status === 'closed' && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Efectivo real</p>
                      <p className="text-xl font-bold">{formatCurrency(shift.actualCash || 0)}</p>
                    </div>
                  )}
                </div>

                {shift.status === 'closed' && hasDifference && (
                  <div className={`mt-4 flex items-center justify-between p-3 rounded-lg ${
                    (shift.cashDifference || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-5 w-5 ${
                        (shift.cashDifference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`} />
                      <span className="font-medium">Diferencia de caja</span>
                    </div>
                    <span className={`text-xl font-bold ${
                      (shift.cashDifference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(shift.cashDifference || 0) >= 0 ? '+' : ''}{formatCurrency(shift.cashDifference || 0)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Métricas de Ventas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Métricas de Ventas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Órdenes</p>
                    <p className="text-3xl font-bold mt-1">{totalOrders}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                    <p className="text-3xl font-bold mt-1">{formatCurrency(avgTicket)}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Ventas</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">{formatCurrency(shift.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Productos Vendidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(comboSales).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(comboSales).map(([name, data]) => (
                      <div key={name} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">{name}</span>
                        <div className="text-right">
                          <p className="font-bold">{data.qty} unidades</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(data.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay productos vendidos en esta jornada</p>
                )}
              </CardContent>
            </Card>

            {/* Lista de Órdenes */}
            <Card>
              <CardHeader>
                <CardTitle>Órdenes Completadas ({totalOrders})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orders.map(order => (
                      <div key={order.id} className="flex justify-between items-center p-3 border-b hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-muted-foreground">
                            {formatTime(order.createdAt)}
                          </span>
                          <div>
                            <p className="font-medium">
                              {order.items.map(item => `${item.quantity}x ${item.combo?.name || 'Combo'}`).join(', ')}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">{order.deliveryType}</p>
                          </div>
                        </div>
                        <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay órdenes en esta jornada</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se pudo cargar la información de la jornada</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
