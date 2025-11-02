import { Firestore } from 'firebase/firestore';
import type { InventoryItem } from '@/lib/types';
import type { CreateInventoryDTO, UpdateInventoryDTO } from '@/dtos';
import { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/services/inventoryService';

/**
 * API interna de Inventory
 * Abstrae Firebase del frontend
 */
class InventoryAPIClient {
  private firestore: Firestore | null = null;

  setFirestore(firestore: Firestore) {
    this.firestore = firestore;
  }

  /**
   * Obtiene todos los items del inventario
   */
  async getAll(): Promise<InventoryItem[]> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    return await getInventoryItems(this.firestore);
  }

  /**
   * Crea un nuevo item
   */
  async create(dto: CreateInventoryDTO): Promise<InventoryItem> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    const itemId = await addInventoryItem(this.firestore, dto);

    return {
      ...dto,
      id: itemId
    } as InventoryItem;
  }

  /**
   * Actualiza un item existente
   */
  async update(id: string, dto: UpdateInventoryDTO): Promise<void> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    await updateInventoryItem(this.firestore, id, dto);
  }

  /**
   * Elimina un item
   */
  async delete(id: string): Promise<void> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    await deleteInventoryItem(this.firestore, id);
  }
}

// Singleton
export const InventoryAPI = new InventoryAPIClient();
