/**
 * Order Search Dialog - Lista y Cancelación de Pedidos
 *
 * 🟥 PRESENTATION LAYER - UI Component
 * - Muestra lista de pedidos recientes de la jornada
 * - Permite cancelar pedidos con razón
 * - Usa el OrderContext para la lógica de negocio
 */

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, Package, DollarSign } from 'lucide-react';
import type { Order } from '@/lib/types';

interface OrderSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadOrders: () => Promise<Order[]>;
  onCancel: (orderId: string, reason?: string) => Promise<void>;
}

export function OrderSearchDialog({
  isOpen,
  onClose,
  onLoadOrders,
  onCancel,
}: OrderSearchDialogProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Cargar pedidos cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const results = await onLoadOrders();
      setOrders(results);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Error al cargar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order);
    setCancellationReason('');
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;

    setIsCancelling(true);
    try {
      await onCancel(selectedOrder.id.toString(), cancellationReason);
      setShowCancelDialog(false);
      setSelectedOrder(null);
      // Recargar lista de pedidos
      await loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error instanceof Error ? error.message : 'Error al cancelar pedido');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const formatDateTime = (date: Date | Timestamp | any) => {
    try {
      let dateObj: Date;
      if (date instanceof Timestamp) {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date);
      }

      if (isNaN(dateObj.getTime())) return 'Fecha inválida';
      return format(dateObj, "dd MMM yyyy HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelado</Badge>;
    }
    return <Badge variant="default">Completado</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Pedidos de la Jornada</DialogTitle>
            <DialogDescription>
              Selecciona un pedido para ver detalles o cancelarlo
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay pedidos en esta jornada</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className={`transition-all hover:shadow-md ${
                      order.status === 'cancelled' ? 'opacity-60' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Info principal */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">
                              #{order.id.toString().slice(-8).toUpperCase()}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDateTime(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" />
                              {order.items.length} items
                            </span>
                          </div>

                          {/* Items del pedido */}
                          <div className="text-sm">
                            <div className="flex flex-wrap gap-1">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-muted-foreground"
                                >
                                  {item.combo?.name ||
                                   item.customizations.product?.name ||
                                   'Producto'}
                                  {item.quantity > 1 && ` x${item.quantity}`}
                                  {idx < Math.min(order.items.length, 3) - 1 && ','}
                                </span>
                              ))}
                              {order.items.length > 3 && (
                                <span className="text-muted-foreground">
                                  +{order.items.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Razón de cancelación si aplica */}
                          {order.status === 'cancelled' && order.cancellationReason && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              <strong>Razón:</strong> {order.cancellationReason}
                            </div>
                          )}
                        </div>

                        {/* Total y acción */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                              <DollarSign className="h-3 w-3" />
                              <span>Total</span>
                            </div>
                            <div className="text-lg font-bold">
                              {formatPrice(order.total)}
                            </div>
                          </div>

                          {order.status === 'completed' ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelClick(order)}
                            >
                              Cancelar
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Cancelado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de cancelación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar este pedido? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedOrder && (
            <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
              <div className="font-medium">
                Pedido #{selectedOrder.id.toString().slice(-8).toUpperCase()}
              </div>
              <div className="text-muted-foreground">
                Total: {formatPrice(selectedOrder.total)}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Razón de cancelación (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Ejemplo: Cliente solicitó cancelación, error en pedido..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {cancellationReason.length}/500 caracteres
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              No, mantener pedido
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? 'Cancelando...' : 'Sí, cancelar pedido'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
