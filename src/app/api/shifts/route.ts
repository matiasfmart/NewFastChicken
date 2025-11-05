/**
 * API Route: Shifts
 *
 * Maneja las operaciones de jornadas desde el cliente
 */

import { NextResponse } from 'next/server';
import { initializeMongoDB } from '@/lib/mongodb-init';
import { ShiftAPI } from '@/api';
import type { Shift } from '@/lib/types';

async function ensureInitialized() {
  await initializeMongoDB();
}

export async function GET(request: Request) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const id = searchParams.get('id');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (id) {
      const shift = await ShiftAPI.getById(id);
      return NextResponse.json(shift);
    }

    if (active === 'true') {
      const shift = await ShiftAPI.getActiveShift();
      return NextResponse.json(shift);
    }

    // Soporte para filtrado por rango de fechas
    if (startDate && endDate) {
      const shifts = await ShiftAPI.getByDateRange(new Date(startDate), new Date(endDate));
      return NextResponse.json(shifts);
    }

    const shifts = await ShiftAPI.getAll();
    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error in GET /api/shifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();

    const shiftData: Omit<Shift, 'id'> = await request.json();
    const shift = await ShiftAPI.create(shiftData);
    return NextResponse.json(shift);
  } catch (error) {
    console.error('Error in POST /api/shifts:', error);
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureInitialized();

    const { id, updates } = await request.json();

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing id or updates' },
        { status: 400 }
      );
    }

    await ShiftAPI.update(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/shifts:', error);
    return NextResponse.json(
      { error: 'Failed to update shift' },
      { status: 500 }
    );
  }
}
