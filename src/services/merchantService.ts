import { db, firestoreCollections } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, addDoc, query, getDocs, where, orderBy, limit, collection } from 'firebase/firestore'
import {
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { BeneficialOwner, DocumentFormData } from '@/types/merchant'
import { BankDetails } from '@/types/merchant'

export interface ProcessingMix {
  cardPresentPercentage: number
  ecommercePercentage: number
}

export interface ProcessingVolumes {
  monthlyVolume: number
  averageTicket: number
  highTicket: number
}

export interface CustomerServiceInfo {
  phone: string
  email: string
}

export interface BusinessInformation {
  legalName: string
  dba?: string
  taxId: string
  businessType: string
  yearEstablished: string
  website?: string
  businessDescription: string
  customerService: CustomerServiceInfo
}

export interface ProcessingHistory {
  isCurrentlyProcessing: string
  currentProcessor?: string | null
  hasBeenTerminated: string
  terminationExplanation?: string | null
  volumes: ProcessingVolumes
  processingMix: ProcessingMix
}

export interface MerchantApplication {
  id?: string
  businessInfo: BusinessInformation
  processingHistory: ProcessingHistory
  beneficialOwners: BeneficialOwner[]
  bankDetails: BankDetails
  documents: DocumentFormData
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id?: string
  email: string
  firstName?: string
  lastName?: string
  applicationId?: string
  status: 'new' | 'in_progress' | 'completed'
  createdAt: Date
  updatedAt: Date
  businessInfo?: Partial<BusinessInformation>
  processingHistory?: Partial<ProcessingHistory>
  beneficialOwners?: Partial<BeneficialOwner>[]
  bankDetails?: Partial<BankDetails>
  documents?: Partial<DocumentFormData>
}

class MerchantService {
  private readonly COLLECTION = firestoreCollections.merchantApplications
  private readonly LEADS_COLLECTION = firestoreCollections.leads

  async createApplication(data: Omit<MerchantApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.COLLECTION, {
        ...data,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating merchant application:', error)
      throw new Error('Failed to create merchant application')
    }
  }

  async updateApplication(id: string, data: Partial<MerchantApplication>): Promise<void> {
    try {
      const docRef = doc(db, 'merchantApplications', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating merchant application:', error)
      throw new Error('Failed to update merchant application')
    }
  }

  async updateProcessingHistory(id: string, data: ProcessingHistory): Promise<void> {
    try {
      const docRef = doc(db, 'merchantApplications', id)
      await updateDoc(docRef, {
        'processingHistory': {
          ...data,
          volumes: {
            monthlyVolume: Number(data.volumes.monthlyVolume),
            averageTicket: Number(data.volumes.averageTicket),
            highTicket: Number(data.volumes.highTicket)
          },
          processingMix: {
            cardPresentPercentage: Number(data.processingMix.cardPresentPercentage),
            ecommercePercentage: Number(data.processingMix.ecommercePercentage)
          }
        },
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating processing history:', error)
      throw new Error('Failed to update processing history')
    }
  }

  async updateBusinessInformation(id: string, data: BusinessInformation): Promise<void> {
    try {
      const docRef = doc(db, 'merchantApplications', id)
      await updateDoc(docRef, {
        'businessInfo': {
          ...data,
          customerService: {
            phone: data.customerService.phone.trim(),
            email: data.customerService.email.trim().toLowerCase()
          }
        },
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating business information:', error)
      throw new Error('Failed to update business information')
    }
  }

  async getApplication(id: string): Promise<MerchantApplication | null> {
    try {
      const docRef = doc(db, 'merchantApplications', id)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) return null
      return { id: docSnap.id, ...docSnap.data() } as MerchantApplication
    } catch (error) {
      console.error('Error fetching merchant application:', error)
      throw new Error('Failed to fetch merchant application')
    }
  }

  async submitApplication(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'merchantApplications', id)
      await updateDoc(docRef, {
        status: 'submitted',
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error submitting merchant application:', error)
      throw new Error('Failed to submit merchant application')
    }
  }

  async getLeadByEmail(email: string): Promise<Lead | null> {
    try {
      const q = query(
        this.LEADS_COLLECTION,
        where('email', '==', email.toLowerCase()),
        orderBy('createdAt', 'desc'),
        limit(1)
      )

      try {
        const querySnapshot = await getDocs(q)
        if (querySnapshot.empty) return null

        const doc = querySnapshot.docs[0] as QueryDocumentSnapshot<DocumentData>
        const data = doc.data()
        return {
          id: doc.id,
          email: data.email,
          applicationId: data.applicationId,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Lead
      } catch (error: any) {
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          const simpleQuery = query(
            this.LEADS_COLLECTION,
            where('email', '==', email.toLowerCase()),
            limit(1)
          )
          const snapshot = await getDocs(simpleQuery)
          if (snapshot.empty) return null

          const doc = snapshot.docs[0] as QueryDocumentSnapshot<DocumentData>
          const data = doc.data()
          return {
            id: doc.id,
            email: data.email,
            applicationId: data.applicationId,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          } as Lead
        }
        throw error
      }
    } catch (error) {
      console.error('Error fetching lead by email:', error)
      throw new Error('Failed to fetch lead')
    }
  }

  async createLead(email: string, firstName?: string, lastName?: string): Promise<string> {
    try {
      const lead: Omit<Lead, 'id'> = {
        email: email.toLowerCase(),
        firstName,
        lastName,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(this.LEADS_COLLECTION, lead)
      return docRef.id
    } catch (error) {
      console.error('Error creating lead:', error)
      throw new Error('Failed to create lead')
    }
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    try {
      const docRef = doc(db, 'leads', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating lead:', error)
      throw new Error('Failed to update lead')
    }
  }

  async updateLeadStatus(id: string, status: Lead['status']): Promise<void> {
    try {
      const docRef = doc(db, 'leads', id)
      await updateDoc(docRef, {
        status,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating lead status:', error)
      throw new Error('Failed to update lead status')
    }
  }

  async linkLeadToApplication(leadId: string, applicationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'leads', leadId)
      await updateDoc(docRef, {
        applicationId,
        status: 'in_progress',
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error linking lead to application:', error)
      throw new Error('Failed to link lead to application')
    }
  }

  async getLeadByApplicationId(applicationId: string): Promise<Lead | null> {
    try {
      const leadsRef = collection(db, 'leads')
      const q = query(leadsRef, where('applicationId', '==', applicationId))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      }
    } catch (error) {
      console.error('Error getting lead by application ID:', error)
      throw error
    }
  }

  async updateBeneficialOwners(id: string, data: BeneficialOwner[]): Promise<void> {
    try {
      const docRef = doc(db, 'merchantApplications', id)
      await updateDoc(docRef, {
        'beneficialOwners': data,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating beneficial owners:', error)
      throw new Error('Failed to update beneficial owners')
    }
  }

  async updateBankDetails(id: string, data: BankDetails): Promise<void> {
    try {
      const docRef = doc(db, 'merchantApplications', id)
      await updateDoc(docRef, {
        'bankDetails': data,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating bank details:', error)
      throw new Error('Failed to update bank details')
    }
  }

  async updateDocuments(id: string, data: DocumentFormData): Promise<void> {
    try {
      const docRef = doc(db, 'merchantApplications', id)
      await updateDoc(docRef, {
        'documents': data,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating documents:', error)
      throw new Error('Failed to update documents')
    }
  }
}

export const merchantService = new MerchantService()
