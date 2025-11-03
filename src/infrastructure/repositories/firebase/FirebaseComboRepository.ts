import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, getDoc, Firestore } from 'firebase/firestore';
import type { Combo } from '@/lib/types';
import type { IComboRepository } from '@/domain/repositories/IComboRepository';

/**
 * Implementación Firebase del IComboRepository
 */
export class FirebaseComboRepository implements IComboRepository {
  private readonly collectionName = 'combos';

  constructor(private readonly firestore: Firestore) {}

  async getAll(): Promise<Combo[]> {
    const querySnapshot = await getDocs(collection(this.firestore, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Combo));
  }

  async getById(id: string): Promise<Combo | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Combo;
  }

  async create(combo: Omit<Combo, 'id'>): Promise<Combo> {
    const docRef = await addDoc(collection(this.firestore, this.collectionName), combo);
    return {
      id: docRef.id,
      ...combo
    } as Combo;
  }

  async update(id: string, combo: Partial<Omit<Combo, 'id'>>): Promise<void> {
    const comboRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(comboRef, combo);
  }

  async delete(id: string): Promise<void> {
    const comboRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(comboRef);
  }
}
