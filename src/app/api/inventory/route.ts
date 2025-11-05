/**
 * API Route: Inventory
 *
 * Maneja las operaciones de inventario desde el cliente
 */

import { NextResponse } from 'next/server';
import { initializeMongoDB } from '@/lib/mongodb-init';
import { InventoryAPI } from '@/api';
import type { CreateInventoryDTO, UpdateInventoryDTO } from '@/dtos';

async function ensureInitialized() {
  await initializeMongoDB();
}

export async function GET() {
  try {
    await ensureInitialized();
    const inventory = await InventoryAPI.getAll();
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error in GET /api/inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();
    const dto: CreateInventoryDTO = await request.json();
    const item = await InventoryAPI.create(dto);
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error in POST /api/inventory:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureInitialized();
    const { id, updates }: { id: string; updates: UpdateInventoryDTO } = await request.json();

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing id or updates' },
        { status: 400 }
      );
    }

    await InventoryAPI.update(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/inventory:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureInitialized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    await InventoryAPI.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/inventory:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
