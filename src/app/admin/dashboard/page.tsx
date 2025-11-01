import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Bienvenido, Administrador</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales (Hoy)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% desde ayer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items más vendidos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Combo Pollo Clásico</div>
              <p className="text-xs text-muted-foreground">542 vendidos hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock bajo</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 items</div>
              <p className="text-xs text-muted-foreground">Papas fritas, Coca Cola, Alitas</p>
            </CardContent>
          </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Guía Rápida</CardTitle>
                <CardDescription>Utilice la barra de navegación de la izquierda para gestionar el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-muted-foreground">
                    <li><b>Dashboard:</b> Esta vista principal.</li>
                    <li><b>Inventario:</b> Vea y actualice el stock y precios de productos, bebidas y guarniciones.</li>
                    <li><b>Combos:</b> Cree y edite los combos del menú, configure sus productos y descuentos.</li>
                    <li><b>Previsiones:</b> Use la IA para obtener sugerencias de reposición de stock.</li>
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}
