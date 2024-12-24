import { db } from "@/lib/firebase"
import { doc, updateDoc, Timestamp, collection, addDoc, query, where, orderBy, getDocs, getDoc } from "firebase/firestore"
import { Note } from "@/types/merchant"
import { emailService } from "@/services/emailService"
import { CustomerService } from "@/services/customerService"
import { Activity } from "@/types/crm"

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
      const merchant = await CustomerService.getCustomer(merchantId)

      const success = await emailService.sendEmail({
        to: data.recipientEmail,
        subject: data.subject,
        content: data.content
      })

      if (success) {
        // Log the email activity
        await this.logActivity({
          type: 'email_sent',
          description: `Email sent to ${data.recipientEmail}`,
          userId: 'system', // TODO: Get actual user ID
          merchantId,
          merchant: {
            businessName: merchant.businessInfo.legalName
          },
          metadata: {
            recipientEmail: data.recipientEmail,
            subject: data.subject,
            content: data.content
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
          noteContent: note.content,
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
      const q = query(
        collection(db, `leads/${merchantId}/communications`),
        where('type', '==', 'email'),
        orderBy('timestamp', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[]
    } catch (error) {
      console.error('Error fetching email threads:', error)
      throw error
    }
  },

  async getActivities(merchantId: string, type: 'note' | 'phone_call' | 'email_sent'): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, `leads/${merchantId}/communications`),
        where('type', '==', type),
        orderBy('metadata.isPinned', 'desc'),
        orderBy('timestamp', 'desc')
      )

      const snapshot = await getDocs(q)
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[]

      // For notes, sort with pinned notes first
      if (type === 'note') {
        return activities.sort((a, b) => {
          if (a.metadata?.isPinned && !b.metadata?.isPinned) return -1
          if (!a.metadata?.isPinned && b.metadata?.isPinned) return 1
          if (a.metadata?.isPinned && b.metadata?.isPinned) {
            // Both pinned, sort by pinnedAt
            const aPinnedAt = a.metadata.pinnedAt?.toMillis() || 0
            const bPinnedAt = b.metadata.pinnedAt?.toMillis() || 0
            return bPinnedAt - aPinnedAt
          }
          // Both unpinned or no pin info, sort by timestamp
          return b.timestamp.toMillis() - a.timestamp.toMillis()
        })
      }

      return activities
    } catch (error) {
      console.error(`Error fetching ${type} activities:`, error)
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          type: type,
          merchantId: merchantId
        })
      }
      throw error
    }
  },

  async updateNote(merchantId: string, noteId: string, updatedNote: Activity): Promise<void> {
    try {
      const noteRef = doc(db, `leads/${merchantId}/communications`, noteId)
      await updateDoc(noteRef, {
        ...updatedNote,
        timestamp: updatedNote.timestamp.toDate()
      })
    } catch (error) {
      console.error("Error updating note:", error)
      throw error
    }
  },

  async addPhoneCall(merchantId: string, data: {
    duration: string
    outcome: 'successful' | 'no_answer' | 'follow_up_required' | 'voicemail' | 'other'
    notes: string
    agentId?: string
    agentName?: string
  }): Promise<void> {
    try {
      const leadRef = doc(db, "leads", merchantId)
      const leadSnap = await getDoc(leadRef)
      const lead = leadSnap.data()

      await this.logActivity({
        type: "phone_call",
        description: `Phone call - ${data.outcome}`,
        userId: data.agentId || 'system',
        merchantId,
        merchant: {
          businessName: lead?.businessName || "Unknown Business"
        },
        metadata: {
          duration: data.duration,
          outcome: data.outcome,
          notes: data.notes,
          agentId: data.agentId,
          agentName: data.agentName,
          createdAt: Timestamp.now()
        }
      })

      // Update lead's updatedAt timestamp
      await updateDoc(leadRef, {
        updatedAt: new Date()
      })
    } catch (error) {
      console.error("Error adding phone call:", error)
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
