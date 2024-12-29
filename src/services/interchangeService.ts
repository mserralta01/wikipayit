import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InterchangeRates } from '@/types/interchange';

const COLLECTION = 'interchangeRates';
const DEFAULT_DOC_ID = 'default';

export const interchangeService = {
  async getInterchangeRates(): Promise<InterchangeRates | null> {
    const docRef = doc(db, COLLECTION, DEFAULT_DOC_ID);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as InterchangeRates) : null;
  },

  async updateInterchangeRates(rates: Omit<InterchangeRates, 'id' | 'lastUpdated' | 'updatedBy'>, userId: string): Promise<void> {
    const docRef = doc(db, COLLECTION, DEFAULT_DOC_ID);
    await setDoc(docRef, {
      ...rates,
      id: DEFAULT_DOC_ID,
      lastUpdated: new Date(),
      updatedBy: userId,
    }, { merge: true });
  }
}; 