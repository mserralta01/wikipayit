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
      const docRef = doc(db, 'configuration', WEBSITE_CONFIG_DOC)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return data.sections as Section[]
      }
      
      // If no document exists, create one with initial sections
      const initialSections = getInitialSections()
      await this.saveSections(initialSections)
      return initialSections
    } catch (error) {
      console.error('Error fetching sections:', error)
      throw error
    }
  },

  async saveSections(sections: Section[]): Promise<void> {
    try {
      const docRef = doc(db, 'configuration', WEBSITE_CONFIG_DOC)
      await setDoc(docRef, { 
        sections,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving sections:', error)
      throw error
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