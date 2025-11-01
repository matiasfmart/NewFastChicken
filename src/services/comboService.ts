
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, Firestore } from 'firebase/firestore';
import type { Combo } from '@/lib/types';

const COMBOS_COLLECTION = 'combos';

// Create
export const addCombo = async (db: Firestore, combo: Omit<Combo, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COMBOS_COLLECTION), combo);
  return docRef.id;
};

// Read
export const getCombos = async (db: Firestore): Promise<Combo[]> => {
  const querySnapshot = await getDocs(collection(db, COMBOS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Combo));
};

// Update
export const updateCombo = async (db: Firestore, id: string, data: Partial<Omit<Combo, 'id'>>) => {
  const comboRef = doc(db, COMBOS_COLLECTION, id);
  await updateDoc(comboRef, data);
};

// Delete
export const deleteCombo = async (db: Firestore, id: string) => {
  const comboRef = doc(db, COMBOS_COLLECTION, id);
  await deleteDoc(comboRef);
};
