import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { combos } from "@/lib/data";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function CombosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Combos</CardTitle>
        <CardDescription>Cree, edite y elimine los combos del menú.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-right">
            <Button>Crear Nuevo Combo</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combos.filter(c => ['PO', 'BG', 'E'].includes(c.type)).map((combo) => (
              <TableRow key={combo.id}>
                <TableCell className="font-medium">{combo.id}</TableCell>
                <TableCell>{combo.name}</TableCell>
                <TableCell><Badge variant="outline">{combo.type}</Badge></TableCell>
                <TableCell>${combo.price.toLocaleString('es-AR')}</TableCell>
                <TableCell>{combo.discount ? `${combo.discount}%` : '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
