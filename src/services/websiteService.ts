import { db } from '../lib/firebase'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  writeBatch,
  getDoc,
  limit,
} from 'firebase/firestore'

export type Section = {
  id: string
  name: string
  enabled: boolean
  order: number
}

// Cache management
let cachedSections: Section[] | null = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const websiteService = {
  async checkConnection(): Promise<boolean> {
    try {
      // Try to fetch the sections collection instead of a specific document
      const sectionsRef = collection(db, 'sections')
      const q = query(sectionsRef, limit(1))
      await getDocs(q)
      return true
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('offline')) {
          console.warn('App is offline, using cached data if available')
          return false
        }
        console.error('Database connection check failed:', error)
      }
      return false
    }
  },

  async getSections(): Promise<Section[]> {
    try {
      // Check if we have valid cached data
      const now = Date.now()
      if (cachedSections && (now - lastFetch) < CACHE_DURATION) {
        console.log('Returning cached sections:', cachedSections)
        return cachedSections
      }

      console.log('Fetching sections from Firestore...')
      const sectionsRef = collection(db, 'sections')
      const q = query(sectionsRef, orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        console.log('No sections found in Firestore')
        return []
      }

      const sections = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Section[]

      console.log('Fetched sections:', sections)
      
      // Update cache
      cachedSections = sections
      lastFetch = now

      return sections
    } catch (error) {
      console.error('Error getting sections:', error)
      throw error
    }
  },

  async updateSections(sections: Section[]): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      sections.forEach((section, index) => {
        const sectionRef = doc(db, 'sections', section.id)
        batch.update(sectionRef, {
          order: index,
          enabled: section.enabled,
        })
      })

      await batch.commit()
      
      // Invalidate cache after update
      cachedSections = null
      lastFetch = 0
    } catch (error) {
      console.error('Error updating sections:', error)
      throw error
    }
  },

  async initializeSections(sections: Section[]): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      sections.forEach((section) => {
        const sectionRef = doc(db, 'sections', section.id)
        batch.set(sectionRef, section)
      })

      await batch.commit()
      
      // Invalidate cache after initialization
      cachedSections = null
      lastFetch = 0
    } catch (error) {
      console.error('Error initializing sections:', error)
      throw error
    }
  },
}
