/**
 * API Route: Employees
 *
 * Maneja las operaciones de empleados desde el cliente
 */

import { NextResponse } from 'next/server';
import { initializeMongoDB } from '@/lib/mongodb-init';
import { EmployeeAPI } from '@/api';
import type { Employee } from '@/lib/types';

async function ensureInitialized() {
  await initializeMongoDB();
}

export async function GET(request: Request) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const employees = activeOnly
      ? await EmployeeAPI.getActive()
      : await EmployeeAPI.getAll();

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error in GET /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();
    const employeeData: Omit<Employee, 'id'> = await request.json();
    const employee = await EmployeeAPI.create(employeeData);
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error in POST /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureInitialized();
    const { id, updates }: { id: string; updates: Partial<Omit<Employee, 'id'>> } = await request.json();

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing id or updates' },
        { status: 400 }
      );
    }

    await EmployeeAPI.update(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
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

    await EmployeeAPI.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
