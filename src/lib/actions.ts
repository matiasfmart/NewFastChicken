"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MongoDBAppConfigRepository } from "@/infrastructure/repositories/mongodb/MongoDBAppConfigRepository";

interface LoginState {
  success: boolean;
  error: string | null;
}

export async function login(previousState: LoginState, formData: FormData): Promise<LoginState> {
  const user = formData.get("user") as string;
  const password = formData.get("password") as string;

  try {
    // Inicializar repository y obtener configuración
    const repository = await MongoDBAppConfigRepository.initialize();

    // Asegurar que existe configuración por defecto
    await repository.ensureDefaultConfig();

    // Obtener configuración actual
    const config = await repository.getConfig();

    if (!config) {
      return { success: false, error: "Error de configuración del sistema" };
    }

    // Validar credenciales contra la base de datos
    if (user === config.adminUsername && password === config.adminPassword) {
      const cookieStore = await cookies();
      cookieStore.set("session", "admin-user", { httpOnly: true, path: "/" });
      return { success: true, error: null };
    } else {
      return { success: false, error: "Usuario o contraseña inválidos" };
    }
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: "Error al validar credenciales" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/admin/login");
}
