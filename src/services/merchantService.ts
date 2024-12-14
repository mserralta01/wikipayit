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
} from "firebase/firestore"
import { Merchant, BeneficialOwner, Lead } from "../types/merchant"
import { Activity } from '../types/activity'

const getDashboardMetrics = async (): Promise<any> => {
  // Implement logic to fetch dashboard metrics
};

const getRecentActivity = async (): Promise<Activity[]> => {
  // Implement logic to fetch recent activity
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
      
      // Check if lead already exists before creating
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
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        return { 
          id: doc.id, 
          ...data,
          currentStep: typeof data.currentStep === 'number' ? data.currentStep : 1,
          formData: data.formData || { email },
          status: data.status || "started",
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
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
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          currentStep: typeof data.currentStep === 'number' ? data.currentStep : 1,
          formData: data.formData || {},
          status: data.status || "started",
          pipelineStatus: data.pipelineStatus || "lead",
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
        } as Lead
      })
    } catch (error) {
      console.error("Error getting leads:", error)
      throw error
    }
  },

  async createMerchant(merchantData: Merchant): Promise<string> {
    try {
      const merchantsRef = collection(db, "merchants")
      const docRef = await addDoc(merchantsRef, {
        ...merchantData,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating merchant:", error)
      throw error
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
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
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
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
        } as Merchant
      })
    } catch (error) {
      console.error("Error getting merchants:", error)
      throw error
    }
  },

  async updateMerchantStatus(
    merchantId: string,
    status: "pending" | "approved" | "rejected"
  ): Promise<void> {
    try {
      const merchantRef = doc(db, "merchants", merchantId)
      await updateDoc(merchantRef, {
        status,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error updating merchant status:", error)
      throw error
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
        pipelineStatus: merchant.status === 'approved' ? 'approved' as const : 'lead' as const
      }))

      const leadItems = leads.map(lead => ({
        ...lead,
        pipelineStatus: 'lead' as const
      }))

      return [...merchantItems, ...leadItems]
    } catch (error) {
      console.error("Error getting pipeline items:", error)
      throw error
    }
  },

  async getApplications() {
    const applicationsRef = collection(db, 'merchants')
    const q = query(applicationsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString()
    }))
  },

  getDashboardMetrics,
  getRecentActivity,
}
