
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, Firestore, DocumentData, PartialWithFieldValue } from 'firebase/firestore';
import type { InventoryItem } from '@/lib/types';

const INVENTORY_COLLECTION = 'inventory';

// Create
export const addInventoryItem = async (db: Firestore, item: Omit<InventoryItem, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, INVENTORY_COLLECTION), item);
  return docRef.id;
};

// Read
export const getInventoryItems = async (db: Firestore): Promise<InventoryItem[]> => {
  const querySnapshot = await getDocs(collection(db, INVENTORY_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
};

// Update
export const updateInventoryItem = async (db: Firestore, id: string, data: Partial<Omit<InventoryItem, 'id'>>) => {
  const itemRef = doc(db, INVENTORY_COLLECTION, id);
  await updateDoc(itemRef, data);
};

// Delete
export const deleteInventoryItem = async (db: Firestore, id: string) => {
  const itemRef = doc(db, INVENTORY_COLLECTION, id);
  await deleteDoc(itemRef);
};
