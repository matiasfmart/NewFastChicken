"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const { toast } = useToast();

  // Cargar configuración actual
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      setLoadingCurrent(true);
      const response = await fetch('/api/config');

      if (response.ok) {
        const data = await response.json();
        setCurrentUsername(data.username);
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
    } finally {
      setLoadingCurrent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Usuario y contraseña son requeridos",
      });
      return;
    }

    if (username.length < 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El usuario debe tener al menos 3 caracteres",
      });
      return;
    }

    if (password.length < 4) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 4 caracteres",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUsername(data.username);
        setUsername("");
        setPassword("");

        toast({
          title: "✓ Credenciales actualizadas",
          description: "Las credenciales de administrador se actualizaron correctamente",
        });
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Error al actualizar credenciales",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar credenciales",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las credenciales de acceso al panel de administrador
        </p>
      </div>

      {/* Información actual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Configuración Actual
          </CardTitle>
          <CardDescription>
            Usuario actual del administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCurrent ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">Usuario:</span>
              <span className="text-muted-foreground">{currentUsername || "No configurado"}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de actualización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Actualizar Credenciales
          </CardTitle>
          <CardDescription>
            Cambia el usuario y contraseña para acceder al panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nuevo Usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa el nuevo usuario"
                minLength={3}
              />
              <p className="text-sm text-muted-foreground">
                Mínimo 3 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la nueva contraseña"
                minLength={4}
              />
              <p className="text-sm text-muted-foreground">
                Mínimo 4 caracteres
              </p>
            </div>

            <Alert variant="default" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Guarda las nuevas credenciales en un lugar seguro.
                Si olvidas la contraseña, necesitarás acceso a la base de datos para recuperarla.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Credenciales"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
