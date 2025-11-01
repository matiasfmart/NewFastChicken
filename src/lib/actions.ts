"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { forecastStock as runForecastStock, type ForecastStockInput, type ForecastStockOutput } from "@/ai/flows/stock-forecasting";

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

export async function forecastStock(input: ForecastStockInput): Promise<ForecastStockOutput> {
    return runForecastStock(input);
}
