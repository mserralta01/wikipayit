import { db } from '../lib/firebase'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore'
import { useToast } from '../hooks/useToast'

export type Section = {
  id: string
  name: string
  enabled: boolean
  order: number
}

export const websiteService = {
  async getSections(): Promise<Section[]> {
    try {
      const sectionsRef = collection(db, 'sections')
      const q = query(sectionsRef, orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        console.log('No sections found')
        return []
      }

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Section[]
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
    } catch (error) {
      console.error('Error initializing sections:', error)
      throw error
    }
  },
}
