import { db } from "../lib/firebase"
import { doc, updateDoc, arrayRemove } from "firebase/firestore"
import { Merchant } from "../types/merchant"

export const merchantDocuments = {
  async deleteDocument(merchantId: string, documentType: 'bank_statements' | 'drivers_license' | 'voided_check', url: string): Promise<void> {
    try {
      const merchantRef = doc(db, 'merchants', merchantId)
      
      // For bank statements, remove the specific URL from the array
      if (documentType === 'bank_statements') {
        await updateDoc(merchantRef, {
          bank_statements: arrayRemove(url)
        })
      }
      // For drivers_license and voided_check, set to null/empty since they're single documents
      else if (documentType === 'drivers_license') {
        await updateDoc(merchantRef, {
          drivers_license: null
        })
      }
      else if (documentType === 'voided_check') {
        await updateDoc(merchantRef, {
          voided_check: null
        })
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      throw new Error('Failed to delete document')
    }
  }
}
