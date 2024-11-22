import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore'
import { Merchant, MerchantStatus } from '@/types/merchant'

export const merchantService = {
  async getMerchants(): Promise<Merchant[]> {
    const merchantsRef = collection(db, 'merchants')
    const snapshot = await getDocs(query(merchantsRef, orderBy('updatedAt', 'desc')))
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Merchant[]
  },

  async updateMerchantStatus(merchantId: string, status: MerchantStatus): Promise<void> {
    const merchantRef = doc(db, 'merchants', merchantId)
    await updateDoc(merchantRef, {
      status,
      updatedAt: new Date()
    })
  }
} 