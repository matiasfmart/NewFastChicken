"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(previousState: any, formData: FormData) {
  const user = formData.get("user");
  const password = formData.get("password");

  // In a real app, you'd validate against a database
  if (user === "admin" && password === "admin") {
    cookies().set("session", "admin-user", { httpOnly: true, path: "/" });
    return { success: true, error: null };
  } else {
    return { success: false, error: "Usuario o contraseña inválidos" };
  }
}

export async function logout() {
  cookies().delete("session");
  redirect("/admin/login");
}
