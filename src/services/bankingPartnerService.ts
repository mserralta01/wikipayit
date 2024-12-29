import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  BankingPartner, 
  BankContact, 
  BankAgreement,
  BankingPartnerNote 
} from '@/types/bankingPartner';

const BANKING_PARTNERS_COLLECTION = 'bankingPartners';
const CONTACTS_COLLECTION = 'bankContacts';
const AGREEMENTS_COLLECTION = 'bankAgreements';
const NOTES_COLLECTION = 'bankingPartnerNotes';

export const bankingPartnerService = {
  // Banking Partner CRUD
  async createBankingPartner(data: Omit<BankingPartner, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, BANKING_PARTNERS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getBankingPartner(id: string): Promise<BankingPartner | null> {
    try {
      const docRef = doc(db, BANKING_PARTNERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as BankingPartner : null;
    } catch (error) {
      console.error('Error getting banking partner:', error);
      throw error;
    }
  },

  async getAllBankingPartners(): Promise<BankingPartner[]> {
    try {
      const q = query(
        collection(db, BANKING_PARTNERS_COLLECTION),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BankingPartner);
    } catch (error) {
      console.error('Error getting all banking partners:', error);
      throw error;
    }
  },

  async updateBankingPartner(id: string, data: Partial<BankingPartner>): Promise<void> {
    try {
      const docRef = doc(db, BANKING_PARTNERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating banking partner:', error);
      throw error;
    }
  },

  async deleteBankingPartner(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, BANKING_PARTNERS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting banking partner:', error);
      throw error;
    }
  },

  // Contacts CRUD
  async addContact(data: Omit<BankContact, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  },

  async getContactsByPartnerId(partnerId: string): Promise<BankContact[]> {
    try {
      const q = query(
        collection(db, CONTACTS_COLLECTION),
        where('bankingPartnerId', '==', partnerId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BankContact);
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  },

  async updateContact(id: string, data: Partial<BankContact>): Promise<void> {
    try {
      await updateDoc(doc(db, CONTACTS_COLLECTION, id), data);
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  async deleteContact(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, CONTACTS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  // Agreements CRUD
  async addAgreement(data: Omit<BankAgreement, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, AGREEMENTS_COLLECTION), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding agreement:', error);
      throw error;
    }
  },

  async getAgreementsByPartnerId(partnerId: string): Promise<BankAgreement[]> {
    try {
      // First try with ordering
      try {
        const q = query(
          collection(db, AGREEMENTS_COLLECTION),
          where('bankingPartnerId', '==', partnerId),
          orderBy('startDate', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BankAgreement);
      } catch (indexError) {
        // If index error, fallback to unordered query
        console.warn('Index not found, falling back to unordered query:', indexError);
        const q = query(
          collection(db, AGREEMENTS_COLLECTION),
          where('bankingPartnerId', '==', partnerId)
        );
        const querySnapshot = await getDocs(q);
        const agreements = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }) as BankAgreement);
        
        // Sort in memory
        return agreements.sort((a, b) => b.startDate.seconds - a.startDate.seconds);
      }
    } catch (error) {
      console.error('Error getting agreements:', error);
      return [];
    }
  },

  async updateAgreement(id: string, data: Partial<BankAgreement>): Promise<void> {
    try {
      await updateDoc(doc(db, AGREEMENTS_COLLECTION, id), data);
    } catch (error) {
      console.error('Error updating agreement:', error);
      throw error;
    }
  },

  async deleteAgreement(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, AGREEMENTS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting agreement:', error);
      throw error;
    }
  },

  // Document Upload
  async uploadAgreementDocument(
    partnerId: string,
    agreementId: string,
    file: File
  ): Promise<string> {
    try {
      const path = `banking-partners/${partnerId}/agreements/${agreementId}/${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async deleteAgreementDocument(url: string): Promise<void> {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Notes CRUD
  async addNote(data: Omit<BankingPartnerNote, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  async getNotesByPartnerId(partnerId: string): Promise<BankingPartnerNote[]> {
    try {
      const q = query(
        collection(db, NOTES_COLLECTION),
        where('bankingPartnerId', '==', partnerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BankingPartnerNote);
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  async updateNote(id: string, content: string): Promise<void> {
    try {
      await updateDoc(doc(db, NOTES_COLLECTION, id), { content });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NOTES_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },
}; 