/**
 * API Route: Orders
 *
 * Maneja las operaciones de órdenes desde el cliente
 */

import { NextResponse } from 'next/server';
import { initializeMongoDB } from '@/lib/mongodb-init';
import { OrderAPI } from '@/api';
import type { Order } from '@/lib/types';

async function ensureInitialized() {
  await initializeMongoDB();
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();

    const orderData: Omit<Order, 'id'> = await request.json();
    const order = await OrderAPI.create(orderData);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const orders = await OrderAPI.getByDate(new Date(date));
      return NextResponse.json(orders);
    }

    const orders = await OrderAPI.getAll();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
