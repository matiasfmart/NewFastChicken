import { ForecastingClient } from "@/components/admin/ForecastingClient";

export default function ForecastingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Previsión de Stock con IA</h1>
      <p className="text-muted-foreground mb-6">
        Utilice la inteligencia artificial para analizar datos históricos de ventas y predecir la demanda de ingredientes.
        La IA generará sugerencias de reposición para optimizar su planificación de inventario.
      </p>
      <ForecastingClient />
    </div>
  );
}
