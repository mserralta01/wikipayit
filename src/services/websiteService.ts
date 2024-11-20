import { db } from '../lib/firebase'
import { collection, doc, setDoc, getDoc, DocumentData } from 'firebase/firestore'

export type Section = {
  id: string
  name: string
  enabled: boolean
  order: number
}

const WEBSITE_CONFIG_DOC = 'website_config'
const SECTIONS_FIELD = 'sections'

export const websiteService = {
  async getSections(): Promise<Section[]> {
    try {
      const docRef = doc(db, 'website', WEBSITE_CONFIG_DOC)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (!data.sections) {
          console.warn('No sections found in document, initializing with defaults')
          const initialSections = getInitialSections()
          await this.saveSections(initialSections)
          return initialSections
        }
        return data.sections as Section[]
      }
      
      console.log('No website_config document exists, creating initial configuration')
      const initialSections = getInitialSections()
      await this.saveSections(initialSections)
      return initialSections
    } catch (error) {
      console.error('Error fetching sections:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      throw new Error('Failed to fetch sections. Please check your database connection and permissions.')
    }
  },

  async saveSections(sections: Section[]): Promise<void> {
    try {
      const docRef = doc(db, 'website', WEBSITE_CONFIG_DOC)
      await setDoc(docRef, { 
        sections: sections.map((section, index) => ({
          ...section,
          order: index // Ensure order is always sequential
        })),
        updatedAt: new Date().toISOString()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving sections:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      throw new Error('Failed to save sections. Please check your database connection and permissions.')
    }
  }
}

export function getInitialSections(): Section[] {
  return [
    { id: 'hero', name: 'Hero Section', enabled: true, order: 0 },
    { id: 'industries', name: 'Industries Section', enabled: true, order: 1 },
    { id: 'entrepreneur', name: 'Entrepreneur Section', enabled: true, order: 2 },
    { id: 'pos', name: 'POS Section', enabled: true, order: 3 },
    { id: 'gateway', name: 'Gateway Section', enabled: true, order: 4 },
    { id: 'highRisk', name: 'High Risk Section', enabled: true, order: 5 },
    { id: 'pricing', name: 'Pricing Section', enabled: true, order: 6 },
    { id: 'ach', name: 'ACH Section', enabled: true, order: 7 },
    { id: 'testimonials', name: 'Testimonials Section', enabled: true, order: 8 },
    { id: 'contact', name: 'Contact Form', enabled: true, order: 9 },
  ]
}
