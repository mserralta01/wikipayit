import { storage } from "../lib/firebase"
import { ref, deleteObject } from "firebase/storage"
import { db } from "../lib/firebase"
import { doc, updateDoc, arrayRemove } from "firebase/firestore"

export const merchantDocuments = {
  async deleteDocument(
    merchantId: string,
    type: 'bank_statements' | 'drivers_license' | 'voided_check',
    url: string
  ): Promise<void> {
    try {
      // Extract the path from the URL
      const urlObj = new URL(url)
      const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0])
      const storageRef = ref(storage, path)

      // Delete from Storage
      await deleteObject(storageRef)

      // Update Firestore document
      // Try updating in both merchants and leads collections
      try {
        const merchantRef = doc(db, 'merchants', merchantId)
        await updateDoc(merchantRef, {
          [`formData.${type}`]: type === 'bank_statements' 
            ? arrayRemove(url)  // For bank_statements array
            : null  // For single document fields
        })
      } catch (error) {
        // If not found in merchants, try leads collection
        const leadRef = doc(db, 'leads', merchantId)
        await updateDoc(leadRef, {
          [`formData.${type}`]: type === 'bank_statements' 
            ? arrayRemove(url)  // For bank_statements array
            : null  // For single document fields
        })
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      throw new Error("Failed to delete document. Please try again.")
    }
  }
}
