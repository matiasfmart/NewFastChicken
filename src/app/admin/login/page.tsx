"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FastChickenLogo } from "@/components/icons/FastChickenLogo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Iniciando...' : 'Iniciar Sesión'}</Button>;
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <form action={formAction}>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
                <FastChickenLogo />
            </div>
            <CardTitle>Panel de Administrador</CardTitle>
            <CardDescription>Ingrese sus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Input id="user" name="user" required defaultValue="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required defaultValue="admin"/>
            </div>

            <Alert variant="default" className="!mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-muted-foreground">
                    Usa <b>admin</b> / <b>admin</b> para la demostración.
                </AlertDescription>
            </Alert>

            {state?.error && (
              <Alert variant="destructive" className="!mt-2">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
