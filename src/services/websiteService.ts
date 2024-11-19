import { db } from '../lib/firebase'
import { auth } from '../lib/firebase'
import { FirebaseError } from 'firebase/app'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore'

export type Section = {
  id: string
  name: string
  enabled: boolean
  order: number
}

const WEBSITE_CONFIG_DOC = 'website_config'

export const websiteService = {
  async getSections(): Promise<Section[]> {
    try {
      const docRef = doc(db, 'configuration', WEBSITE_CONFIG_DOC)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return (data.sections as Section[]).sort((a, b) => a.order - b.order)
      }
      
      // If no document exists, create one with initial sections
      const initialSections = getInitialSections()
      await this.saveSections(initialSections)
      return initialSections
    } catch (error) {
      console.error('Error fetching sections:', error)
      
      // If we're offline, try to get from cache
      if (error instanceof FirebaseError && 
          (error.code === 'failed-precondition' || error.code === 'unavailable')) {
        try {
          await disableNetwork(db)
          const docRef = doc(db, 'configuration', WEBSITE_CONFIG_DOC)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data()
            return (data.sections as Section[]).sort((a, b) => a.order - b.order)
          }
        } catch (cacheError) {
          console.error('Failed to fetch from cache:', cacheError)
        } finally {
          // Re-enable network for future requests
          await enableNetwork(db)
        }
      }
      
      // Return initial sections as fallback
      return getInitialSections()
    }
  },

  async saveSections(sections: Section[]): Promise<void> {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('You must be logged in to save changes')
      }

      const docRef = doc(db, 'configuration', WEBSITE_CONFIG_DOC)
      await setDoc(docRef, { 
        sections: sections.map((section, index) => ({
          ...section,
          order: index
        })),
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser.email
      })
    } catch (error) {
      console.error('Error saving sections:', error)
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'permission-denied':
            throw new Error('You do not have permission to save changes')
          case 'unavailable':
            throw new Error('Unable to save changes while offline')
          default:
            throw new Error('Failed to save changes')
        }
      }
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