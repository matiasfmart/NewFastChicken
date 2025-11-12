/**
 * API Route: Search Orders
 *
 * Endpoint para buscar órdenes con filtros
 */

import { NextResponse } from 'next/server';
import { initializeMongoDB } from '@/lib/mongodb-init';
import { OrderAPI } from '@/api';

async function ensureInitialized() {
  await initializeMongoDB();
}

export async function GET(request: Request) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);

    const criteria = {
      orderId: searchParams.get('orderId') || undefined,
      shiftId: searchParams.get('shiftId') || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      status: (searchParams.get('status') as 'completed' | 'cancelled' | 'all') || undefined,
    };

    const orders = await OrderAPI.search(criteria);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error in GET /api/orders/search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search orders' },
      { status: 500 }
    );
  }
}
