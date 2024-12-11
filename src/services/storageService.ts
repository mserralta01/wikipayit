import { storage } from "../lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"

export const storageService = {
  async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file)

      // Return a promise that resolves with the download URL
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            if (onProgress) {
              onProgress(progress)
            }
          },
          (error) => {
            // Handle errors
            console.error("Upload error:", error)
            reject(new Error("Failed to upload file. Please try again."))
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              resolve(downloadURL)
            } catch (error) {
              console.error("Error getting download URL:", error)
              reject(new Error("Failed to get download URL. Please try again."))
            }
          }
        )
      })
    } catch (error) {
      console.error("Storage service error:", error)
      throw new Error("Failed to initiate file upload. Please try again.")
    }
  },

  async uploadBeneficialOwnerID(
    file: File, 
    leadId: string, 
    ownerIndex: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!leadId) {
      throw new Error("Lead ID is required")
    }

    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!extension || !["jpg", "jpeg", "png"].includes(extension)) {
      throw new Error("Invalid file type. Please upload a JPG or PNG file.")
    }

    const path = `beneficial-owners/${leadId}/owner-${ownerIndex}-id.${extension}`
    return this.uploadFile(file, path, onProgress)
  },

  async uploadVoidedCheck(
    file: File,
    leadId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!leadId) {
      throw new Error("Lead ID is required")
    }

    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!extension || !["jpg", "jpeg", "png", "pdf"].includes(extension)) {
      throw new Error("Invalid file type. Please upload a JPG, PNG, or PDF file.")
    }

    const path = `documents/${leadId}/voided-check/check.${extension}`
    return this.uploadFile(file, path, onProgress)
  },

  async uploadBankStatement(
    file: File,
    leadId: string,
    index: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!leadId) {
      throw new Error("Lead ID is required")
    }

    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!extension || !["jpg", "jpeg", "png", "pdf"].includes(extension)) {
      throw new Error("Invalid file type. Please upload a JPG, PNG, or PDF file.")
    }

    const path = `documents/${leadId}/bank-statements/statement-${index + 1}.${extension}`
    return this.uploadFile(file, path, onProgress)
  }
}
