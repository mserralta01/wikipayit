import { emailService } from './emailService'
import { CustomerService } from './customerService'
import { Activity, ActivityType } from '../types/crm'
import { db } from '../lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

interface EmailData {
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
      const primaryContact = merchant.contacts.find(contact => contact.isPrimary)

      if (!primaryContact?.email) {
        throw new Error('No primary contact email found for merchant')
      }

      const success = await emailService.sendEmail({
        to: primaryContact.email,
        subject: data.subject,
        content: data.content
      })

      if (success) {
        // Log the email activity
        await this.logActivity({
          type: 'email_sent',
          description: `Email sent: ${data.subject}`,
          userId: 'system', // TODO: Get actual user ID
          merchantId,
          merchant: {
            businessName: merchant.businessInfo.legalName
          },
          metadata: {
            subject: data.subject,
            recipientEmail: primaryContact.email
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
  }
}
