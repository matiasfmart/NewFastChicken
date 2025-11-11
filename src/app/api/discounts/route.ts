/**
 * API Route: Discounts
 *
 * Maneja las operaciones CRUD de descuentos desde el cliente
 * Incluye endpoints para asignar/desasignar descuentos a combos
 */

import { NextResponse } from 'next/server';
import { initializeMongoDB } from '@/lib/mongodb-init';
import { DiscountAPI } from '@/api';
import type { CreateDiscountInput, UpdateDiscountInput } from '@/application/use-cases';

async function ensureInitialized() {
  await initializeMongoDB();
}

/**
 * GET /api/discounts
 * Obtiene todos los descuentos o filtra por comboId
 */
export async function GET(request: Request) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const comboId = searchParams.get('comboId');
    const active = searchParams.get('active');
    const id = searchParams.get('id');

    // Si se solicita un descuento específico por ID
    if (id) {
      const discount = await DiscountAPI.getById(id);
      if (!discount) {
        return NextResponse.json(
          { error: 'Discount not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(discount);
    }

    // Si se solicita por comboId
    if (comboId) {
      const discounts = await DiscountAPI.getByComboId(comboId);
      return NextResponse.json(discounts);
    }

    // Si se solicitan solo descuentos activos
    if (active === 'true') {
      const discounts = await DiscountAPI.getActiveDiscounts();
      return NextResponse.json(discounts);
    }

    // Obtener todos los descuentos
    const discounts = await DiscountAPI.getAll();
    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error in GET /api/discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discounts
 * Crea un nuevo descuento
 *
 * Body esperado: CreateDiscountInput
 */
export async function POST(request: Request) {
  try {
    await ensureInitialized();
    const input: CreateDiscountInput = await request.json();
    const discount = await DiscountAPI.create(input);
    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/discounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create discount';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/discounts
 * Actualiza un descuento existente o asigna/desasigna de un combo
 *
 * Body para actualizar: { id: string, updates: UpdateDiscountInput }
 * Body para asignar: { action: 'assign', discountId: string, comboId: string }
 * Body para desasignar: { action: 'unassign', discountId: string, comboId: string }
 */
export async function PATCH(request: Request) {
  try {
    await ensureInitialized();
    const body = await request.json();

    // Caso 1: Asignar descuento a combo
    if (body.action === 'assign') {
      const { discountId, comboId } = body;
      if (!discountId || !comboId) {
        return NextResponse.json(
          { error: 'Missing discountId or comboId' },
          { status: 400 }
        );
      }
      await DiscountAPI.assignToCombo(discountId, comboId);
      return NextResponse.json({ success: true });
    }

    // Caso 2: Desasignar descuento de combo
    if (body.action === 'unassign') {
      const { discountId, comboId } = body;
      if (!discountId || !comboId) {
        return NextResponse.json(
          { error: 'Missing discountId or comboId' },
          { status: 400 }
        );
      }
      await DiscountAPI.unassignFromCombo(discountId, comboId);
      return NextResponse.json({ success: true });
    }

    // Caso 3: Actualizar descuento (caso por defecto)
    const { id, updates }: { id: string; updates: Omit<UpdateDiscountInput, 'id'> } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing id or updates' },
        { status: 400 }
      );
    }

    const discount = await DiscountAPI.update(id, updates);
    return NextResponse.json(discount);
  } catch (error) {
    console.error('Error in PATCH /api/discounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update discount';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/discounts
 * Elimina un descuento
 *
 * Query params: id (string)
 */
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

    await DiscountAPI.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/discounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete discount';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
