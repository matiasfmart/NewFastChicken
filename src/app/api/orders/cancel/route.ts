/**
 * API Route: Cancel Order
 *
 * Endpoint para cancelar una orden existente
 */

import { NextResponse } from 'next/server';
import { initializeMongoDB } from '@/lib/mongodb-init';
import { OrderAPI } from '@/api';

async function ensureInitialized() {
  await initializeMongoDB();
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();

    const { id, reason } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const cancelledOrder = await OrderAPI.cancel(id, reason);
    return NextResponse.json(cancelledOrder);
  } catch (error) {
    console.error('Error in POST /api/orders/cancel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
