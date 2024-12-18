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
} from "firebase/firestore"
import { Merchant, BeneficialOwner, Lead, MerchantStatus } from "../types/merchant"
import { Activity } from '../types/activity'
import { ProcessingFormData } from "../components/merchant/ProcessingHistoryStep"
import { PipelineStatus } from "../types/pipeline"

// Application specific type
export interface ApplicationData extends Omit<Merchant, 'status'> {
  businessName: string;
  contactName: string;
  status?: 'pending' | 'approved' | 'rejected';
  businessType: 'sole_proprietorship' | 'partnership' | 'llc' | 'corporation' | 'non_profit';
  processingVolume: number;
  phone: string;
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
        status: "started",
        pipelineStatus: "lead",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
          status: data.status || "started",
          pipelineStatus: data.pipelineStatus || "lead",
          createdAt: toIsoStringOrNow(data.createdAt),
          updatedAt: toIsoStringOrNow(data.updatedAt),
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
          status: data.status || "started",
          pipelineStatus: data.pipelineStatus || "lead",
          createdAt: toIsoStringOrNow(data.createdAt),
          updatedAt: toIsoStringOrNow(data.updatedAt),
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
        status: merchantData.status || "lead",
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
          createdAt: toIsoStringOrNow(data.createdAt),
          updatedAt: toIsoStringOrNow(data.updatedAt),
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
          status: data.status || "lead",
          position: typeof data.position === 'number' ? data.position : 0,
        } as Merchant
      })
    } catch (error) {
      console.error("Error getting merchants:", error)
      throw error
    }
  },

  async updateMerchantStatus(
    merchantId: string,
    newStatus: MerchantStatus
  ): Promise<void> {
    try {
      const merchantRef = doc(db, "merchants", merchantId);
      await updateDoc(merchantRef, {
        pipelineStatus: newStatus,
        status: newStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error updating merchant status:", error);
      throw error;
    }
  },

  async addBeneficialOwner(
    merchantId: string,
    ownerData: BeneficialOwner
  ): Promise<void> {
    try {
      const merchantRef = doc(db, "merchants", merchantId)
      const merchantDoc = await getDoc(merchantRef)
      
      if (!merchantDoc.exists()) {
        throw new Error("Merchant not found")
      }

      const currentOwners = merchantDoc.data()?.beneficialOwners || []
      
      if (currentOwners.length >= 4) {
        throw new Error("Maximum number of beneficial owners reached")
      }

      const totalPercentage = currentOwners.reduce(
        (sum: number, owner: BeneficialOwner) =>
          sum + parseFloat(owner.ownershipPercentage),
        parseFloat(ownerData.ownershipPercentage)
      )

      if (totalPercentage > 100) {
        throw new Error("Total ownership percentage cannot exceed 100%")
      }

      await updateDoc(merchantRef, {
        beneficialOwners: [...currentOwners, ownerData],
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error adding beneficial owner:", error)
      throw error
    }
  },

  async updateBeneficialOwner(
    merchantId: string,
    ownerIndex: number,
    ownerData: BeneficialOwner
  ): Promise<void> {
    try {
      const merchantRef = doc(db, "merchants", merchantId)
      const merchantDoc = await getDoc(merchantRef)
      
      if (!merchantDoc.exists()) {
        throw new Error("Merchant not found")
      }

      const currentOwners = merchantDoc.data()?.beneficialOwners || []
      
      if (ownerIndex < 0 || ownerIndex >= currentOwners.length) {
        throw new Error("Invalid owner index")
      }

      const totalPercentage = currentOwners.reduce(
        (sum: number, owner: BeneficialOwner, index: number) =>
          index === ownerIndex
            ? sum
            : sum + parseFloat(owner.ownershipPercentage),
        parseFloat(ownerData.ownershipPercentage)
      )

      if (totalPercentage > 100) {
        throw new Error("Total ownership percentage cannot exceed 100%")
      }

      const updatedOwners = [...currentOwners]
      updatedOwners[ownerIndex] = ownerData

      await updateDoc(merchantRef, {
        beneficialOwners: updatedOwners,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error updating beneficial owner:", error)
      throw error
    }
  },

  async removeBeneficialOwner(
    merchantId: string,
    ownerIndex: number
  ): Promise<void> {
    try {
      const merchantRef = doc(db, "merchants", merchantId)
      const merchantDoc = await getDoc(merchantRef)
      
      if (!merchantDoc.exists()) {
        throw new Error("Merchant not found")
      }

      const currentOwners = merchantDoc.data()?.beneficialOwners || []
      
      if (ownerIndex < 0 || ownerIndex >= currentOwners.length) {
        throw new Error("Invalid owner index")
      }

      const updatedOwners = currentOwners.filter(
        (_: BeneficialOwner, index: number) => index !== ownerIndex
      )

      await updateDoc(merchantRef, {
        beneficialOwners: updatedOwners,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error removing beneficial owner:", error)
      throw error
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
      }))

      const leadItems = leads.map(lead => ({
        ...lead,
        pipelineStatus: lead.pipelineStatus || 'lead',
      }))

      return [...merchantItems, ...leadItems]
    } catch (error) {
      console.error("Error getting pipeline items:", error)
      throw error
    }
  },

  async getApplications(): Promise<ApplicationData[]> {
    try {
      const applicationsRef = collection(db, 'merchants')
      const q = query(applicationsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: toIsoStringOrNow(data.createdAt),
          updatedAt: toIsoStringOrNow(data.updatedAt),
          businessName: data.businessName || data.formData?.businessName || '',
          contactName: data.formData?.firstName && data.formData?.lastName 
            ? `${data.formData.firstName} ${data.formData.lastName}`
            : '',
          businessType: (data.formData?.businessType || 'llc') as ApplicationData['businessType'],
          processingVolume: data.formData?.monthlyVolume 
            ? Number(data.formData.monthlyVolume) 
            : 0,
          phone: data.phone || data.formData?.phone || '',
          status: (data.status === 'approved' || data.status === 'rejected' || data.status === 'pending')
            ? data.status
            : 'pending'
        } as ApplicationData
      })
    } catch (error) {
      console.error("Error getting applications:", error)
      throw error
    }
  },

  getDashboardMetrics,
  getRecentActivity,

  async updateProcessingHistory(leadId: string, processingHistory: ProcessingFormData) {
    try {
      const merchantRef = doc(db, 'merchants', leadId);
      
      const requiredFields = [
        'isCurrentlyProcessing',
        'monthlyVolume',
        'averageTicket',
        'highTicket',
        'hasBeenTerminated',
        'cardPresentPercentage',
        'ecommercePercentage'
      ] as const;

      const missingFields = requiredFields.filter(
        field => !processingHistory[field]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const formattedData = {
        processingHistory: {
          ...processingHistory,
          monthlyVolume: Number(processingHistory.monthlyVolume),
          averageTicket: Number(processingHistory.averageTicket),
          highTicket: Number(processingHistory.highTicket),
          cardPresentPercentage: Number(processingHistory.cardPresentPercentage),
          ecommercePercentage: Number(processingHistory.ecommercePercentage),
        },
        updatedAt: serverTimestamp(),
      };

      await updateDoc(merchantRef, formattedData);
    } catch (error) {
      console.error('Error updating processing history:', error);
      throw error;
    }
  },

  async updateLeadStatus(
    leadId: string,
    pipelineStatus: PipelineStatus
  ): Promise<void> {
    try {
      const leadRef = doc(db, "leads", leadId);
      await updateDoc(leadRef, {
        pipelineStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      throw error;
    }
  },

  async migrateMerchantStatuses() {
    const merchantsRef = collection(db, 'merchants');
    const snapshot = await getDocs(merchantsRef);
    const batch = writeBatch(db);
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status && !data.pipelineStatus) {
        batch.update(docSnap.ref, {
          pipelineStatus: data.status.toLowerCase(),
          position: data.position || 0,
          updatedAt: new Date()
        });
      }
    });
    
    await batch.commit();
  },
}
