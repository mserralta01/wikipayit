import { db } from "../lib/firebase"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
  DocumentReference,
} from "firebase/firestore"
import { Merchant, BeneficialOwner, Lead } from "../types/merchant"
import { Activity } from '../types/activity'
import { ProcessingFormData } from "../components/merchant/ProcessingHistoryStep"
import { PipelineStatus } from "../types/pipeline"

// Application specific type
export interface ApplicationData {
  id: string
  status: 'Lead' | 'Phone Calls' | 'Offer Sent' | 'Underwriting' | 'Documents' | 'Approved'
  email: string
  firstName?: string
  lastName?: string
  businessName?: string
  createdAt: Date
  updatedAt: Date
}

// Helper to safely convert Firestore Timestamp or string to ISO string
function toIsoStringOrNow(value: any): string {
  if (value && typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return new Date().toISOString()
}

const getDashboardMetrics = async (): Promise<any> => {
  // Implement logic to fetch dashboard metrics
};

const getRecentActivity = async (): Promise<Activity[]> => {
  const activitiesRef = collection(db, "activities");
  const q = query(activitiesRef, orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Activity));
};

export const merchantService = {
  async createLead(email: string, additionalData: { firstName?: string; lastName?: string } = {}) {
    try {
      const leadsRef = collection(db, "leads")
      const leadData = {
        email,
        formData: {
          email,
          firstName: additionalData.firstName || '',
          lastName: additionalData.lastName || '',
        },
        currentStep: 1,
        pipelineStatus: "lead" as PipelineStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        position: 0,
      }
      
      const existingLead = await this.getLeadByEmail(email)
      if (existingLead) {
        return existingLead.id
      }
      
      const docRef = await addDoc(leadsRef, leadData)
      return docRef.id
    } catch (error) {
      console.error("Error creating lead:", error)
      throw error
    }
  },

  async updateLead(leadId: string, data: Partial<Lead>): Promise<void> {
    try {
      const leadRef = doc(db, "leads", leadId)
      await updateDoc(leadRef, {
        ...data,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error updating lead:", error)
      throw error
    }
  },

  async getLeadByEmail(email: string): Promise<Lead | null> {
    try {
      const leadsRef = collection(db, "leads")
      const q = query(leadsRef, where("email", "==", email), orderBy("updatedAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]
        const data = docSnap.data()
        return { 
          id: docSnap.id, 
          ...data,
          currentStep: typeof data.currentStep === 'number' ? data.currentStep : 1,
          formData: data.formData || { email },
          pipelineStatus: data.pipelineStatus || "lead",
          createdAt: toIsoStringOrNow(data.createdAt),
          updatedAt: toIsoStringOrNow(data.updatedAt),
          position: typeof data.position === 'number' ? data.position : 0,
        } as Lead
      }
      return null
    } catch (error) {
      console.error("Error getting lead:", error)
      throw error
    }
  },

  async getLeads(): Promise<Lead[]> {
    try {
      const leadsRef = collection(db, "leads")
      const q = query(leadsRef, orderBy("updatedAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          currentStep: typeof data.currentStep === 'number' ? data.currentStep : 1,
          formData: data.formData || {},
          pipelineStatus: data.pipelineStatus || "lead",
          createdAt: toIsoStringOrNow(data.createdAt),
          updatedAt: toIsoStringOrNow(data.updatedAt),
          position: typeof data.position === 'number' ? data.position : 0,
        } as Lead
      })
    } catch (error) {
      console.error("Error getting leads:", error)
      throw error
    }
  },

  async createMerchant(leadId: string, merchantData: Partial<Merchant>): Promise<string> {
    try {
      const merchantsRef = collection(db, "merchants");
      const dataForDb = {
        ...merchantData,
        pipelineStatus: merchantData.pipelineStatus || "lead",
        position: merchantData.position ?? 0,
        createdAt: merchantData.createdAt || Timestamp.now(),
        updatedAt: merchantData.updatedAt || Timestamp.now(),
      };
      
      const docRef = await addDoc(merchantsRef, dataForDb);
      return docRef.id;
    } catch (error) {
      console.error("Error creating merchant:", error);
      throw error;
    }
  },

  async updateMerchant(
    merchantId: string,
    merchantData: Partial<Merchant>
  ): Promise<void> {
    try {
      const merchantRef = doc(db, "merchants", merchantId)
      await updateDoc(merchantRef, {
        ...merchantData,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error updating merchant:", error)
      throw error
    }
  },

  async getMerchant(merchantId: string): Promise<Merchant | null> {
    try {
      const merchantRef = doc(db, "merchants", merchantId)
      const merchantDoc = await getDoc(merchantRef)
      if (merchantDoc.exists()) {
        const data = merchantDoc.data()
        return { 
          id: merchantDoc.id, 
          ...data,
          pipelineStatus: data.pipelineStatus || "lead",
          createdAt: toIsoStringOrNow(data.createdAt),
          updatedAt: toIsoStringOrNow(data.updatedAt),
          position: typeof data.position === 'number' ? data.position : 0,
        } as Merchant
      }
      return null
    } catch (error) {
      console.error("Error getting merchant:", error)
      throw error
    }
  },

  async getMerchants(): Promise<Merchant[]> {
    try {
      const merchantsRef = collection(db, "merchants")
      const q = query(merchantsRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data()
        return { 
          id: docSnap.id, 
          ...data,
          createdAt: toIsoStringOrNow(data.createdAt),
          updatedAt: toIsoStringOrNow(data.updatedAt),
          pipelineStatus: data.pipelineStatus || "lead",
          position: typeof data.position === 'number' ? data.position : 0,
        } as Merchant
      })
    } catch (error) {
      console.error("Error getting merchants:", error)
      throw error
    }
  },

  async updatePipelineStatus(
    itemId: string,
    newStatus: PipelineStatus,
    newPosition: number,
    isLead: boolean = true
  ): Promise<void> {
    try {
      const collectionName = isLead ? "leads" : "merchants";
      const itemRef = doc(db, collectionName, itemId);
      
      // Update both status and position in a single operation
      await updateDoc(itemRef, {
        pipelineStatus: newStatus,
        position: newPosition,
        updatedAt: Timestamp.now()
      });

      // Log the status change in communications
      await this.logStatusChange(itemRef, newStatus);
    } catch (error) {
      console.error("Error updating pipeline status:", error);
      throw error;
    }
  },

  async logStatusChange(
    itemRef: DocumentReference,
    newStatus: PipelineStatus
  ): Promise<void> {
    try {
      const communicationsRef = collection(itemRef, 'communications');
      await addDoc(communicationsRef, {
        type: 'status_change',
        timestamp: Timestamp.now(),
        metadata: {
          newStatus,
        }
      });
    } catch (error) {
      console.error("Error logging status change:", error);
      // Don't throw here to prevent blocking the main status update
      // Just log the error
    }
  },

  async getPipelineItems() {
    try {
      const [merchants, leads] = await Promise.all([
        this.getMerchants(),
        this.getLeads()
      ])

      const merchantItems = merchants.map(merchant => ({
        ...merchant,
        pipelineStatus: merchant.pipelineStatus || 'lead',
        position: typeof merchant.position === 'number' ? merchant.position : 0,
      }))

      const leadItems = leads.map(lead => ({
        ...lead,
        pipelineStatus: lead.pipelineStatus || 'lead',
        position: typeof lead.position === 'number' ? lead.position : 0,
      }))

      return [...merchantItems, ...leadItems]
    } catch (error) {
      console.error("Error getting pipeline items:", error)
      throw error
    }
  },

  async migrateMerchantStatuses() {
    const batch = writeBatch(db);
    
    // Migrate merchants
    const merchantsRef = collection(db, 'merchants');
    const merchantsSnapshot = await getDocs(merchantsRef);
    
    merchantsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.pipelineStatus || data.status !== data.pipelineStatus) {
        batch.update(docSnap.ref, {
          pipelineStatus: data.status?.toLowerCase() || 'lead',
          position: data.position || 0,
          updatedAt: Timestamp.now()
        });
      }
    });
    
    // Migrate leads
    const leadsRef = collection(db, 'leads');
    const leadsSnapshot = await getDocs(leadsRef);
    
    leadsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.pipelineStatus || data.status !== data.pipelineStatus) {
        batch.update(docSnap.ref, {
          pipelineStatus: data.status?.toLowerCase() || 'lead',
          position: data.position || 0,
          updatedAt: Timestamp.now()
        });
      }
    });
    
    await batch.commit();
  },

  getDashboardMetrics,
  getRecentActivity,

  async getApplications(): Promise<ApplicationData[]> {
    const applicationsRef = collection(db, 'applications')
    const snapshot = await getDocs(applicationsRef)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ApplicationData[]
  },

  async updateMerchantStatus(merchantId: string, status: ApplicationData['status']): Promise<void> {
    const merchantRef = doc(db, 'applications', merchantId)
    await updateDoc(merchantRef, {
      status,
      updatedAt: new Date()
    })
  }
}
