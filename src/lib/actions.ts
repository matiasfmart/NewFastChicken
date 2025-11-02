"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LoginState {
  success: boolean;
  error: string | null;
}

export async function login(previousState: LoginState, formData: FormData): Promise<LoginState> {
  const user = formData.get("user");
  const password = formData.get("password");

  // In a real app, you'd validate against a database
  if (user === "admin" && password === "admin") {
    const cookieStore = await cookies();
    cookieStore.set("session", "admin-user", { httpOnly: true, path: "/" });
    return { success: true, error: null };
  } else {
    return { success: false, error: "Usuario o contraseña inválidos" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/admin/login");
}
