"use client";

import React, { useState, useEffect } from 'react';
import { EmployeeAPI } from '@/api';
import type { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    role: 'cashier',
    active: true
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await EmployeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setFormData(employee);
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        role: 'cashier',
        active: true
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      name: '',
      role: 'cashier',
      active: true
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (isEditing && formData.id) {
        const { id, ...updates } = formData;
        await EmployeeAPI.update(id, updates);
      } else {
        await EmployeeAPI.create({
          name: formData.name!,
          role: formData.role as 'cashier' | 'admin',
          active: formData.active ?? true,
          createdAt: new Date()
        });
      }
      handleCloseDialog();
      await fetchEmployees();
    } catch (error) {
      console.error("Failed to save employee:", error);
    }
  };

  const confirmDeleteEmployee = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (employeeToDelete) {
      try {
        await EmployeeAPI.delete(employeeToDelete);
        setDeleteAlertOpen(false);
        setEmployeeToDelete(null);
        await fetchEmployees();
      } catch (error) {
        console.error("Failed to delete employee:", error);
      }
    }
  };

  const toggleActiveStatus = async (employee: Employee) => {
    try {
      await EmployeeAPI.update(employee.id, { active: !employee.active });
      await fetchEmployees();
    } catch (error) {
      console.error("Failed to update employee status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Empleados</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra el personal y sus permisos</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as 'cashier' | 'admin' })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Cajero</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active ?? true}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="active">Activo</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {employee.name}
              </CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(employee)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => confirmDeleteEmployee(employee.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rol:</span>
                  <Badge variant="outline">
                    {employee.role === 'cashier' ? 'Cajero' : 'Admin'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActiveStatus(employee)}
                    className="h-8"
                  >
                    {employee.active ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-green-600">Activo</span>
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-gray-400">Inactivo</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No hay empleados registrados</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Crear primer empleado
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará al empleado como inactivo. No se eliminará permanentemente, pero no podrá iniciar nuevas jornadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
