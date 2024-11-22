import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  doc,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Merchant, Activity, MerchantStatus } from '../types/merchant'
import { auth } from '../lib/firebase'

export const merchantService = {
  async getDashboardMetrics() {
    const merchantsRef = collection(db, 'merchants')
    const approvedMerchants = await getDocs(
      query(merchantsRef, where('status', '==', 'approved'))
    )
    const pendingApplications = await getDocs(
      query(merchantsRef, where('status', 'in', ['underwriting', 'documents']))
    )
    const activeLeads = await getDocs(
      query(merchantsRef, where('status', 'in', ['lead', 'phone', 'offer']))
    )
    
    const monthlyRevenue = approvedMerchants.docs.reduce((acc, doc) => {
      const data = doc.data()
      return acc + (data.processingVolume || 0) * (data.rate || 0)
    }, 0)

    return {
      totalMerchants: approvedMerchants.size,
      pendingApplications: pendingApplications.size,
      monthlyRevenue,
      activeLeads: activeLeads.size
    }
  },

  async getRecentActivity(): Promise<Activity[]> {
    const activitiesRef = collection(db, 'activities')
    const snapshot = await getDocs(
      query(activitiesRef, orderBy('timestamp', 'desc'), limit(5))
    )
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        type: data.type,
        merchantId: data.merchantId,
        description: data.description,
        performedBy: data.performedBy,
        timestamp: (data.timestamp as Timestamp).toDate()
      }
    })
  },

  async getAllMerchants(): Promise<Merchant[]> {
    const merchantsRef = collection(db, 'merchants')
    const snapshot = await getDocs(query(merchantsRef, orderBy('updatedAt', 'desc')))
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate()
    })) as Merchant[]
  },

  async updateMerchantStatus(merchantId: string, newStatus: MerchantStatus): Promise<void> {
    const merchantRef = doc(db, 'merchants', merchantId)
    const activityRef = collection(db, 'activities')
    
    await runTransaction(db, async (transaction) => {
      const merchantDoc = await transaction.get(merchantRef)
      if (!merchantDoc.exists()) {
        throw new Error('Merchant not found')
      }

      const oldStatus = merchantDoc.data().status
      
      // Update merchant status
      transaction.update(merchantRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      })

      // Create activity log
      transaction.set(doc(activityRef), {
        type: 'status_change',
        merchantId,
        description: `Status changed from ${oldStatus} to ${newStatus}`,
        performedBy: auth.currentUser?.email || 'System',
        timestamp: serverTimestamp()
      })
    })
  },

  async getApplications(): Promise<Merchant[]> {
    const merchantsRef = collection(db, 'merchants')
    const snapshot = await getDocs(
      query(
        merchantsRef,
        where('status', 'in', ['underwriting', 'documents']),
        orderBy('updatedAt', 'desc')
      )
    )
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate()
    })) as Merchant[]
  }
} 