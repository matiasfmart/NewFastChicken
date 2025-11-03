import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, getDoc, Firestore } from 'firebase/firestore';
import type { InventoryItem } from '@/lib/types';
import type { IInventoryRepository } from '@/domain/repositories/IInventoryRepository';

/**
 * Implementación Firebase del IInventoryRepository
 *
 * Esta clase encapsula TODA la lógica específica de Firebase.
 * Si cambias de base de datos, solo creas una nueva implementación
 * (ej: MongoInventoryRepository) sin tocar el resto del código.
 */
export class FirebaseInventoryRepository implements IInventoryRepository {
  private readonly collectionName = 'inventory';

  constructor(private readonly firestore: Firestore) {}

  async getAll(): Promise<InventoryItem[]> {
    const querySnapshot = await getDocs(collection(this.firestore, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InventoryItem));
  }

  async getById(id: string): Promise<InventoryItem | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as InventoryItem;
  }

  async create(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const docRef = await addDoc(collection(this.firestore, this.collectionName), item);
    return {
      id: docRef.id,
      ...item
    } as InventoryItem;
  }

  async update(id: string, item: Partial<Omit<InventoryItem, 'id'>>): Promise<void> {
    const itemRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(itemRef, item);
  }

  async delete(id: string): Promise<void> {
    const itemRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(itemRef);
  }
}
