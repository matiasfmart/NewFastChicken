/**
 * API Route: Combos
 *
 * Maneja las operaciones de combos desde el cliente
 */

import { NextResponse } from 'next/server';
import { initializeMongoDB } from '@/lib/mongodb-init';
import { ComboAPI } from '@/api';
import type { CreateComboDTO, UpdateComboDTO } from '@/dtos';

async function ensureInitialized() {
  await initializeMongoDB();
}

export async function GET() {
  try {
    await ensureInitialized();
    const combos = await ComboAPI.getAll();
    return NextResponse.json(combos);
  } catch (error) {
    console.error('Error in GET /api/combos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch combos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();
    const dto: CreateComboDTO = await request.json();
    const combo = await ComboAPI.create(dto);
    return NextResponse.json(combo);
  } catch (error) {
    console.error('Error in POST /api/combos:', error);
    return NextResponse.json(
      { error: 'Failed to create combo' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureInitialized();
    const { id, updates }: { id: string; updates: UpdateComboDTO } = await request.json();

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing id or updates' },
        { status: 400 }
      );
    }

    await ComboAPI.update(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/combos:', error);
    return NextResponse.json(
      { error: 'Failed to update combo' },
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

    await ComboAPI.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/combos:', error);
    return NextResponse.json(
      { error: 'Failed to delete combo' },
      { status: 500 }
    );
  }
}
