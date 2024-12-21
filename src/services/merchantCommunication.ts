import { db } from "@/lib/firebase"
import { doc, updateDoc, arrayUnion, Timestamp, collection, addDoc, query, where, orderBy, getDocs, getDoc } from "firebase/firestore"
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

  async addNote(merchantId: string, note: Note): Promise<void> {
    try {
      const merchantRef = doc(db, "merchants", merchantId)
      const merchantSnap = await getDoc(merchantRef)
      const merchant = merchantSnap.data()

      await updateDoc(merchantRef, {
        notes: arrayUnion(note),
        updatedAt: new Date()
      })

      // Log the note activity
      await this.logActivity({
        type: "note",
        description: note.content,
        userId: note.createdBy,
        merchantId,
        merchant: {
          businessName: merchant?.businessName || "Unknown Business"
        },
        metadata: {
          noteContent: note.content,
          createdAt: note.createdAt
        }
      })
    } catch (error) {
      console.error("Error adding note:", error)
      throw error
    }
  },

  async logActivity(activity: CommunicationActivity): Promise<void> {
    const activitiesRef = collection(db, 'activities')
    const timestamp = Timestamp.now()

    await addDoc(activitiesRef, {
      ...activity,
      timestamp: timestamp.toDate()
    })
  },

  async getEmailThreads(merchantId: string): Promise<Activity[]> {
    try {
      const activitiesRef = collection(db, 'activities')
      const q = query(
        activitiesRef,
        where('merchantId', '==', merchantId),
        where('type', '==', 'email_sent'),
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
      const activitiesRef = collection(db, 'activities')
      const q = query(
        activitiesRef,
        where('merchantId', '==', merchantId),
        where('type', '==', type),
        orderBy('timestamp', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[]
    } catch (error) {
      console.error(`Error fetching ${type} activities:`, error)
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
      const merchantRef = doc(db, "merchants", merchantId)
      const merchantSnap = await getDoc(merchantRef)
      const merchant = merchantSnap.data()

      await this.logActivity({
        type: "phone_call",
        description: `Phone call - ${data.outcome}`,
        userId: data.agentId || 'system',
        merchantId,
        merchant: {
          businessName: merchant?.businessName || "Unknown Business"
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

      // Update merchant's updatedAt timestamp
      await updateDoc(merchantRef, {
        updatedAt: new Date()
      })
    } catch (error) {
      console.error("Error adding phone call:", error)
      throw error
    }
  }
}
