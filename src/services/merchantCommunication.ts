import { emailService } from './emailService'
import { CustomerService } from './customerService'
import { Activity, ActivityType } from '../types/crm'
import { db } from '../lib/firebase'
import { collection, addDoc, Timestamp, query, where, orderBy, getDocs } from 'firebase/firestore'

interface EmailData {
  recipientEmail: string
  subject: string
  content: string
}

interface CommunicationActivity extends Omit<Activity, 'id' | 'timestamp'> {
  metadata?: Record<string, any>
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

  async addNote(merchantId: string, note: string): Promise<void> {
    try {
      const merchant = await CustomerService.getCustomer(merchantId)

      await CustomerService.addNote(merchantId, {
        content: note,
        createdBy: 'system' // TODO: Get actual user ID
      })

      // Log the note activity
      await this.logActivity({
        type: 'note',
        description: note,
        userId: 'system', // TODO: Get actual user ID
        merchantId,
        merchant: {
          businessName: merchant.businessInfo.legalName
        }
      })
    } catch (error) {
      console.error('Error adding note:', error)
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
  }
}
