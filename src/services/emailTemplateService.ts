import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  isEnabled: boolean
  description: string
  lastModified?: Date
}

const TEMPLATES_COLLECTION = 'emailTemplates'

export const emailTemplateService = {
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const templatesRef = collection(db, TEMPLATES_COLLECTION)
      const snapshot = await getDocs(templatesRef)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastModified: doc.data().lastModified?.toDate()
      })) as EmailTemplate[]
    } catch (error) {
      console.error('Error fetching email templates:', error)
      throw error
    }
  },

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
      const templateRef = doc(db, TEMPLATES_COLLECTION, templateId)
      const snapshot = await getDoc(templateRef)
      
      if (!snapshot.exists()) {
        return null
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
        lastModified: snapshot.data().lastModified?.toDate()
      } as EmailTemplate
    } catch (error) {
      console.error('Error fetching email template:', error)
      throw error
    }
  },

  async updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<void> {
    try {
      const templateRef = doc(db, TEMPLATES_COLLECTION, templateId)
      await setDoc(templateRef, {
        ...template,
        lastModified: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('Error updating email template:', error)
      throw error
    }
  },

  async toggleTemplate(templateId: string, isEnabled: boolean): Promise<void> {
    try {
      const templateRef = doc(db, TEMPLATES_COLLECTION, templateId)
      await setDoc(templateRef, {
        isEnabled,
        lastModified: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('Error toggling email template:', error)
      throw error
    }
  },

  replaceVariables(content: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (text, [key, value]) => text.replace(new RegExp(`{${key}}`, 'g'), value),
      content
    )
  }
} 