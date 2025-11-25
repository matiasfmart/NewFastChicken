/**
 * API Route: /api/config
 *
 * GET - Obtiene la configuración actual (sin exponer la contraseña)
 * PATCH - Actualiza las credenciales de admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoDBAppConfigRepository } from '@/infrastructure/repositories/mongodb/MongoDBAppConfigRepository';
import type { UpdateAdminCredentialsDTO } from '@/dtos/appConfig.dto';

/**
 * GET /api/config
 * Obtiene la configuración (solo username, no password)
 */
export async function GET() {
  try {
    const repository = await MongoDBAppConfigRepository.initialize();
    const config = await repository.getConfig();

    if (!config) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      );
    }

    // No exponemos la contraseña en el GET
    return NextResponse.json({
      username: config.adminUsername,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/config
 * Actualiza las credenciales de admin
 */
export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateAdminCredentialsDTO = await request.json();

    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (body.username.length < 3) {
      return NextResponse.json(
        { error: 'El usuario debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (body.password.length < 4) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      );
    }

    const repository = await MongoDBAppConfigRepository.initialize();
    await repository.updateCredentials(body.username, body.password);

    return NextResponse.json({
      message: 'Credenciales actualizadas correctamente',
      username: body.username
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
