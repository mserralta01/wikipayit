import { db } from '../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export const adminService = {
  async createAdmin(uid: string, email: string) {
    await setDoc(doc(db, 'admins', uid), {
      email,
      role: 'admin',
      createdAt: new Date().toISOString()
    })
  }
} 