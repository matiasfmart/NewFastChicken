import { Firestore } from 'firebase/firestore';
import type { Combo } from '@/lib/types';
import type { CreateComboDTO, UpdateComboDTO } from '@/dtos';
import { getCombos, addCombo, updateCombo, deleteCombo } from '@/services/comboService';

/**
 * API interna de Combos
 * Abstrae Firebase del frontend
 */
class ComboAPIClient {
  private firestore: Firestore | null = null;

  setFirestore(firestore: Firestore) {
    this.firestore = firestore;
  }

  /**
   * Obtiene todos los combos
   */
  async getAll(): Promise<Combo[]> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    return await getCombos(this.firestore);
  }

  /**
   * Crea un nuevo combo
   */
  async create(dto: CreateComboDTO): Promise<Combo> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    const comboId = await addCombo(this.firestore, dto);

    return {
      ...dto,
      id: comboId
    } as Combo;
  }

  /**
   * Actualiza un combo existente
   */
  async update(id: string, dto: UpdateComboDTO): Promise<void> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    await updateCombo(this.firestore, id, dto);
  }

  /**
   * Elimina un combo
   */
  async delete(id: string): Promise<void> {
    if (!this.firestore) {
      throw new Error('Firestore not initialized');
    }

    await deleteCombo(this.firestore, id);
  }
}

// Singleton
export const ComboAPI = new ComboAPIClient();
