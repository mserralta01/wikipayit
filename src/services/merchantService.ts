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
import { Merchant, BeneficialOwner } from "../types/merchant"

export const merchantService = {
  async createLead(email: string): Promise<string> {
    try {
      const leadsRef = collection(db, "leads")
      const docRef = await addDoc(leadsRef, {
        email,
        status: "started",
        currentStep: 1, // Changed from "authentication" to 1
        formData: { email }, // Added to ensure email is in formData
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating lead:", error)
      throw error
    }
  },

  async updateLead(leadId: string, data: any): Promise<void> {
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

  async getLeadByEmail(email: string): Promise<any | null> {
    try {
      const leadsRef = collection(db, "leads")
      const q = query(leadsRef, where("email", "==", email), orderBy("updatedAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        // Ensure currentStep is a number
        return { 
          id: doc.id, 
          ...data,
          currentStep: typeof data.currentStep === 'number' ? data.currentStep : 1,
          formData: data.formData || { email }
        }
      }
      return null
    } catch (error) {
      console.error("Error getting lead:", error)
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
        return { id: merchantDoc.id, ...merchantDoc.data() } as Merchant
      }
      return null
    } catch (error) {
      console.error("Error getting merchant:", error)
      throw error
    }
  },

  async getMerchants(status?: string): Promise<Merchant[]> {
    try {
      const merchantsRef = collection(db, "merchants")
      let q = query(merchantsRef, orderBy("createdAt", "desc"))
      
      if (status) {
        q = query(merchantsRef, where("status", "==", status), orderBy("createdAt", "desc"))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Merchant)
      )
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
      
      // Ensure we don't exceed 4 owners
      if (currentOwners.length >= 4) {
        throw new Error("Maximum number of beneficial owners reached")
      }

      // Calculate total ownership percentage
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

      // Calculate total ownership percentage excluding the owner being updated
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
}
