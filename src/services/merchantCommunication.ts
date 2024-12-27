import { db } from "@/lib/firebase"
import { doc, updateDoc, Timestamp, collection, addDoc, query, where, orderBy, getDocs, getDoc, deleteDoc } from "firebase/firestore"
import { Note } from "@/types/merchant"
import { emailService } from "@/services/emailService"
import { CustomerService } from "@/services/customerService"
import { Activity } from "@/types/crm"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"

interface EmailData {
  recipientEmail: string
  subject: string
  content: string
}

interface CommunicationActivity extends Omit<Activity, 'id' | 'timestamp'> {
  metadata?: {
    subject?: string
    recipientEmail?: string
    content?: string
    duration?: string
    outcome?: 'successful' | 'no_answer' | 'follow_up_required' | 'voicemail' | 'other'
    notes?: string
    agentId?: string
    agentName?: string
    noteContent?: string
    createdAt?: Timestamp
    callDuration?: string
    callOutcome?: 'successful' | 'no_answer' | 'follow_up_required' | 'voicemail' | 'other'
    callNotes?: string
    isPinned?: boolean
    pinnedAt?: Timestamp
  }
}

export const merchantCommunication = {
  async sendEmail(merchantId: string, data: EmailData): Promise<boolean> {
    try {
      console.log('merchantCommunication.sendEmail - Starting:', {
        merchantId,
        recipient: data.recipientEmail,
        subject: data.subject,
        timestamp: new Date().toISOString()
      });

      const success = await emailService.sendEmail({
        to: data.recipientEmail,
        subject: data.subject,
        content: data.content
      });

      console.log('merchantCommunication.sendEmail - Email service response:', {
        success,
        timestamp: new Date().toISOString()
      });

      if (success) {
        // Log the email activity
        console.log('merchantCommunication.sendEmail - Logging activity to Firestore');
        const communicationsRef = collection(db, `leads/${merchantId}/communications`);
        const timestamp = Timestamp.now();
        
        // Create a new communication record directly
        await addDoc(communicationsRef, {
          type: 'email_sent',
          description: `Email sent to ${data.recipientEmail}`,
          userId: 'system', // TODO: Get actual user ID
          merchantId,
          timestamp: timestamp.toDate(),
          merchant: {
            businessName: 'Unknown Business'
          },
          metadata: {
            recipientEmail: data.recipientEmail,
            subject: data.subject,
            content: data.content,
            createdAt: timestamp
          }
        })
      }

      return success
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  },

  async addNote(merchantId: string, note: Note & { isPinned?: boolean }): Promise<void> {
    try {
      const leadRef = doc(db, "leads", merchantId)
      const leadSnap = await getDoc(leadRef)
      const lead = leadSnap.data()

      const communicationsRef = collection(db, `leads/${merchantId}/communications`)
      const timestamp = Timestamp.now()

      // Create the note directly in communications subcollection
      await addDoc(communicationsRef, {
        type: "note",
        description: note.content,
        userId: note.createdBy,
        merchantId,
        timestamp,
        merchant: {
          businessName: lead?.businessName || "Unknown Business"
        },
        metadata: {
          content: note.content,
          createdAt: timestamp,
          agentName: note.agentName,
          isPinned: note.isPinned || false,
          pinnedAt: note.isPinned ? timestamp : null
        }
      })

      // Update lead's updatedAt timestamp
      await updateDoc(leadRef, {
        updatedAt: new Date()
      })
    } catch (error) {
      console.error("Error adding note:", error)
      throw error
    }
  },

  async logActivity(activity: CommunicationActivity): Promise<void> {
    const communicationsRef = collection(db, `leads/${activity.merchantId}/communications`)
    const timestamp = Timestamp.now()

    await addDoc(communicationsRef, {
      ...activity,
      timestamp: timestamp.toDate()
    })
  },

  async getEmailThreads(merchantId: string): Promise<Activity[]> {
    try {
      console.log('getEmailThreads - Starting query for merchantId:', merchantId);
      const q = query(
        collection(db, `leads/${merchantId}/communications`),
        where('type', '==', 'email_sent'),
        orderBy('timestamp', 'desc')
      )
      
      console.log('getEmailThreads - Query constructed:', {
        path: `leads/${merchantId}/communications`,
        filters: ['type == email_sent', 'orderBy timestamp desc']
      });

      const snapshot = await getDocs(q)
      const threads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[]
      
      console.log('getEmailThreads - Results:', {
        count: threads.length,
        threads: threads.map(t => ({
          id: t.id,
          type: t.type,
          timestamp: t.timestamp,
          subject: t.metadata?.subject
        }))
      });
      
      return threads
    } catch (error) {
      console.error('Error fetching email threads:', error)
      throw error
    }
  },

  async getActivities(merchantId: string, type: 'note' | 'phone_call' | 'email_sent'): Promise<Activity[]> {
    try {
      // Update the query to use the communications subcollection
      const communicationsRef = collection(db, `leads/${merchantId}/communications`);
      const q = query(
        communicationsRef,
        where('type', '==', type),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
    } catch (error) {
      console.error(`Error fetching ${type} activities:`, error);
      throw error;
    }
  },

  async updateNote(merchantId: string, noteId: string, updates: Partial<{
    content: string;
    metadata: {
      isPinned?: boolean;
      pinnedAt?: Date | null;
    };
  }>): Promise<void> {
    try {
      const noteRef = doc(db, `leads/${merchantId}/communications`, noteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: new Date()
      });

      // Update lead's updatedAt timestamp
      const leadRef = doc(db, "leads", merchantId);
      await updateDoc(leadRef, {
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  async addPhoneCall(merchantId: string, data: {
    duration: string;
    outcome: 'successful' | 'no_answer' | 'follow_up_required' | 'voicemail' | 'other';
    notes: string;
    agentId?: string;
    agentName?: string;
  }): Promise<void> {
    try {
      const communicationsRef = collection(db, `leads/${merchantId}/communications`);
      const timestamp = Timestamp.now();

      await addDoc(communicationsRef, {
        type: 'phone_call',
        timestamp,
        metadata: {
          duration: data.duration,
          outcome: data.outcome,
          notes: data.notes,
          agentId: data.agentId,
          agentName: data.agentName
        }
      });

      // Update lead's updatedAt timestamp
      const leadRef = doc(db, 'leads', merchantId);
      await updateDoc(leadRef, {
        updatedAt: timestamp
      });
    } catch (error) {
      console.error('Error adding phone call:', error);
      throw error;
    }
  },

  async deleteEmail(merchantId: string, emailId: string): Promise<boolean> {
    try {
      // Update the path to match where emails are actually stored
      const emailRef = doc(db, `leads/${merchantId}/communications`, emailId);
      
      // Delete the document
      await deleteDoc(emailRef);
      
      // Update the lead's updatedAt timestamp
      const leadRef = doc(db, "leads", merchantId);
      await updateDoc(leadRef, {
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting email:", error);
      throw error;
    }
  },

  async deletePhoneCall(merchantId: string, phoneCallId: string): Promise<boolean> {
    try {
      const phoneCallRef = doc(db, `leads/${merchantId}/communications`, phoneCallId);
      
      // Delete the document
      await deleteDoc(phoneCallRef);
      
      // Update the lead's updatedAt timestamp
      const leadRef = doc(db, "leads", merchantId);
      await updateDoc(leadRef, {
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting phone call:", error);
      throw error;
    }
  },

  async deleteNote(merchantId: string, noteId: string): Promise<boolean> {
    try {
      const noteRef = doc(db, `leads/${merchantId}/communications`, noteId);
      
      // Delete the document
      await deleteDoc(noteRef);
      
      // Update the lead's updatedAt timestamp
      const leadRef = doc(db, "leads", merchantId);
      await updateDoc(leadRef, {
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },

  async getDocuments(merchantId: string): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, `leads/${merchantId}/communications`),
        where('type', '==', 'document'),
        orderBy('timestamp', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[]
    } catch (error) {
      console.error('Error fetching documents:', error)
      throw error
    }
  },

  async uploadDocument(
    merchantId: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      const timestamp = Timestamp.now()
      const storageRef = ref(storage, `documents/${merchantId}/${timestamp.toMillis()}_${file.name}`)
      
      // Upload file to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file)
      
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            onProgress?.(progress)
          },
          (error) => {
            console.error('Upload error:', error)
            reject(error)
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              
              // Add document reference to Firestore
              const communicationsRef = collection(db, `leads/${merchantId}/communications`)
              await addDoc(communicationsRef, {
                type: 'document',
                timestamp,
                metadata: {
                  fileName: file.name,
                  mimeType: file.type,
                  size: file.size,
                  url: downloadURL,
                  uploadedBy: user?.displayName || user?.email || 'Unknown',
                  storagePath: uploadTask.snapshot.ref.fullPath
                }
              })

              // Update lead's updatedAt timestamp
              const leadRef = doc(db, "leads", merchantId)
              await updateDoc(leadRef, {
                updatedAt: timestamp
              })

              resolve()
            } catch (error) {
              reject(error)
            }
          }
        )
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  },

  async deleteDocument(merchantId: string, documentId: string): Promise<boolean> {
    try {
      // Get the document reference first to get the storage path
      const docRef = doc(db, `leads/${merchantId}/communications`, documentId)
      const docSnap = await getDoc(docRef)
      const docData = docSnap.data()

      if (docData?.metadata?.storagePath) {
        // Delete the file from storage
        const storageRef = ref(storage, docData.metadata.storagePath)
        await deleteObject(storageRef)
      }

      // Delete the document reference from Firestore
      await deleteDoc(docRef)

      // Update lead's updatedAt timestamp
      const leadRef = doc(db, "leads", merchantId)
      await updateDoc(leadRef, {
        updatedAt: new Date()
      })

      return true
    } catch (error) {
      console.error("Error deleting document:", error)
      throw error
    }
  }
}

// Initialize the activities collection with a basic structure
export const initializeActivities = async () => {
  const activitiesRef = collection(db, 'activities');
  // Add a sample document to create the collection
  await addDoc(activitiesRef, {
    merchantId: '',
    type: 'system',
    timestamp: Timestamp.now(),
    message: 'Collection initialized'
  });
};
