import { db, firestoreCollections } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, addDoc, query, getDocs, where, orderBy, limit, collection } from 'firebase/firestore'
import {
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { BeneficialOwner, DocumentFormData, LeadStatus, PipelineStatus, Lead } from '@/types/merchant'
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

const mapFirestoreDataToLead = (doc: QueryDocumentSnapshot<DocumentData>): Lead => {
  const data = doc.data();
  return {
    id: doc.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    status: (data.status || 'new') as LeadStatus,
    applicationId: data.applicationId,
    businessInfo: data.businessInfo,
    processingHistory: data.processingHistory,
    beneficialOwners: data.beneficialOwners,
    bankDetails: data.bankDetails,
    documents: data.documents,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    pipelineStatus: (data.pipelineStatus || 'lead') as PipelineStatus,
    currentStep: data.currentStep || 0,
    formData: data.formData
  };
};

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

  async getLeadByEmail(email: string): Promise<Lead | null> {
    try {
      const q = query(
        this.LEADS_COLLECTION,
        where('email', '==', email.toLowerCase()),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0] as QueryDocumentSnapshot<DocumentData>;
      return mapFirestoreDataToLead(doc);
    } catch (error: any) {
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        try {
          const simpleQuery = query(
            this.LEADS_COLLECTION,
            where('email', '==', email.toLowerCase()),
            limit(1)
          );
          const snapshot = await getDocs(simpleQuery);
          if (snapshot.empty) return null;

          const doc = snapshot.docs[0] as QueryDocumentSnapshot<DocumentData>;
          return mapFirestoreDataToLead(doc);
        } catch (innerError) {
          console.error('Error with simple query:', innerError);
          throw new Error('Failed to fetch lead with simple query');
        }
      }
      console.error('Error fetching lead by email:', error);
      throw new Error('Failed to fetch lead');
    }
  }

  async createLead(email: string, firstName?: string, lastName?: string): Promise<string> {
    try {
      const lead: Omit<Lead, 'id'> = {
        email: email.toLowerCase(),
        firstName,
        lastName,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pipelineStatus: 'lead'
      };

      const docRef = await addDoc(this.LEADS_COLLECTION, lead);
      return docRef.id;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    try {
      const docRef = doc(db, 'leads', id);
      
      // Remove undefined values and add timestamp
      const cleanData = {
        ...Object.entries(data).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, cleanData);
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead');
    }
  }

  async updateLeadStatus(id: string, status: Lead['status']): Promise<void> {
    try {
      const docRef = doc(db, 'leads', id)
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString()
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
        updatedAt: new Date().toISOString()
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
      return mapFirestoreDataToLead(doc)
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

  async submitApplication(applicationData: any): Promise<any> {
    try {
      const response = await fetch('/api/merchant/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error('Application submission failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }
}

export const merchantService = new MerchantService()
