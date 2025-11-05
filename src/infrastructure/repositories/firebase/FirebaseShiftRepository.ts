import { collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, Timestamp, Firestore, orderBy } from 'firebase/firestore';
import type { Shift } from '@/lib/types';
import type { IShiftRepository } from '@/domain/repositories/IShiftRepository';

/**
 * Implementación Firebase del IShiftRepository
 *
 * Maneja la conversión entre Date (dominio) y Timestamp (Firebase)
 */
export class FirebaseShiftRepository implements IShiftRepository {
  private readonly collectionName = 'shifts';

  constructor(private readonly firestore: Firestore) {}

  /**
   * ✅ SOLUCIÓN AL PROBLEMA DE ÍNDICES
   *
   * En lugar de usar un query compuesto (where + orderBy) que requiere índices:
   * 1. Busca todas las jornadas con status='open' (simple where)
   * 2. Ordena en memoria por startedAt descendente
   * 3. Retorna la primera
   *
   * Ventajas:
   * - No requiere índice compuesto en Firebase
   * - Funciona idéntico en MongoDB, Firebase, PostgreSQL, etc.
   * - Muy eficiente: normalmente hay 0-1 jornadas abiertas
   * - Portable entre bases de datos
   */
  async getActiveShift(): Promise<Shift | null> {
    // Buscar todas las jornadas abiertas (sin orderBy para evitar índice compuesto)
    const q = query(
      collection(this.firestore, this.collectionName),
      where('status', '==', 'open')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    // Si hay más de una (caso raro), ordenar en memoria y tomar la más reciente
    const shifts = snapshot.docs.map(doc => {
      const data = doc.data();
      // Convertir Timestamp a Date
      const startedAt = data.startedAt instanceof Timestamp ? data.startedAt.toDate() : data.startedAt;
      const endedAt = data.endedAt instanceof Timestamp ? data.endedAt.toDate() : data.endedAt;

      return {
        ...data,
        id: doc.id,
        startedAt,
        endedAt
      } as Shift;
    });

    // Ordenar en memoria por startedAt descendente
    shifts.sort((a, b) => {
      const dateA = a.startedAt instanceof Date ? a.startedAt :
                    a.startedAt instanceof Timestamp ? a.startedAt.toDate() :
                    new Date(a.startedAt);
      const dateB = b.startedAt instanceof Date ? b.startedAt :
                    b.startedAt instanceof Timestamp ? b.startedAt.toDate() :
                    new Date(b.startedAt);
      return dateB.getTime() - dateA.getTime();
    });

    return shifts[0];
  }

  async create(shift: Omit<Shift, 'id'>): Promise<Shift> {
    // Convertir Date → Timestamp para Firebase
    const shiftData = {
      ...shift,
      startedAt: shift.startedAt instanceof Date
        ? Timestamp.fromDate(shift.startedAt)
        : shift.startedAt,
      endedAt: shift.endedAt instanceof Date
        ? Timestamp.fromDate(shift.endedAt)
        : shift.endedAt
    };

    // Limpiar campos undefined
    const cleanData = Object.fromEntries(
      Object.entries(shiftData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(this.firestore, this.collectionName), cleanData);

    return {
      ...shift,
      id: docRef.id
    } as Shift;
  }

  async update(id: string, shift: Partial<Omit<Shift, 'id'>>): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);

    // Convertir Date → Timestamp si existe y construir updateData correctamente
    const updateData: Record<string, any> = {};

    for (const [key, value] of Object.entries(shift)) {
      if (value === undefined) continue;

      if (key === 'startedAt' && value instanceof Date) {
        updateData[key] = Timestamp.fromDate(value);
      } else if (key === 'endedAt' && value instanceof Date) {
        updateData[key] = Timestamp.fromDate(value);
      } else {
        updateData[key] = value;
      }
    }

    await updateDoc(docRef, updateData);
  }

  async getAll(): Promise<Shift[]> {
    const q = query(
      collection(this.firestore, this.collectionName),
      orderBy('startedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        startedAt: data.startedAt instanceof Timestamp ? data.startedAt.toDate() : data.startedAt,
        endedAt: data.endedAt instanceof Timestamp ? data.endedAt.toDate() : data.endedAt
      } as Shift;
    });
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    const q = query(
      collection(this.firestore, this.collectionName),
      where('startedAt', '>=', Timestamp.fromDate(startDate)),
      where('startedAt', '<', Timestamp.fromDate(endDate)),
      orderBy('startedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        startedAt: data.startedAt instanceof Timestamp ? data.startedAt.toDate() : data.startedAt,
        endedAt: data.endedAt instanceof Timestamp ? data.endedAt.toDate() : data.endedAt
      } as Shift;
    });
  }

  async getById(id: string): Promise<Shift | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      startedAt: data.startedAt instanceof Timestamp ? data.startedAt.toDate() : data.startedAt,
      endedAt: data.endedAt instanceof Timestamp ? data.endedAt.toDate() : data.endedAt
    } as Shift;
  }
}
