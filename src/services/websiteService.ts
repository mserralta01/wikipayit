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
  setDoc,
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
        return cachedSections
      }

      const sectionsRef = collection(db, 'sections')
      const q = query(sectionsRef, orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return []
      }

      const sections = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Section[]
      
      // Update cache
      cachedSections = sections
      lastFetch = now

      return sections
    } catch (error) {
      console.error('Error getting sections:', error)
      // Return empty array instead of throwing
      return []
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
      // Don't throw, just log the error
    }
  },

  async initializeSections(sections: Section[]): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      for (const section of sections) {
        const sectionRef = doc(db, 'sections', section.id)
        // Use setDoc instead of batch.set to ensure each document is created
        await setDoc(sectionRef, {
          name: section.name,
          enabled: section.enabled,
          order: section.order,
        })
      }
      
      // Invalidate cache after initialization
      cachedSections = null
      lastFetch = 0
    } catch (error) {
      console.error('Error initializing sections:', error)
      // Don't throw, just log the error
    }
  },
}
