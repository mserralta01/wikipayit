import { db, auth } from '../lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface APISettings {
  mapbox?: {
    enabled?: boolean
    apiKey?: string
    geocodingEndpoint?: string
  }
  stripe?: {
    publicKey?: string
    secretKey?: string
  }
  sendgrid?: {
    enabled?: boolean
    apiKey?: string
    fromEmail?: string
  }
}

// Use a direct path to the settings document
const SETTINGS_DOC_PATH = 'settings/api'

// Helper to clean undefined values from an object
const cleanUndefinedValues = (obj: any): any => {
  const cleaned: any = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const cleanedNested = cleanUndefinedValues(obj[key]);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = obj[key];
      }
    }
  });
  
  return cleaned;
};

export const apiSettingsService = {
  async getSettings(): Promise<APISettings> {
    try {
      // Debug auth state
      const currentUser = auth.currentUser;
      console.log('Current user:', currentUser?.email);
      
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, SETTINGS_DOC_PATH)
      const docSnap = await getDoc(docRef)
      
      console.log('Fetched settings from Firestore:', docSnap.exists() ? 'Document exists' : 'No document')
      
      // Try to create the document first, then read it
      try {
        const initialSettings: APISettings = {};
        await setDoc(docRef, initialSettings, { merge: true });
        console.log('Created/Updated settings document');
        
        // Re-fetch to get the latest data
        const updatedSnap = await getDoc(docRef);
        return updatedSnap.data() as APISettings || initialSettings;
      } catch (error) {
        console.log('Error creating settings document, attempting to read existing:', error);
        if (docSnap.exists()) {
          return docSnap.data() as APISettings;
        }
        return {};
      }
    } catch (error) {
      console.error('Error fetching API settings:', error)
      throw error instanceof Error ? error : new Error('Failed to fetch API settings')
    }
  },

  async updateSettings(settings: Partial<APISettings>): Promise<void> {
    try {
      // Debug auth state
      const currentUser = auth.currentUser;
      console.log('Current user:', currentUser?.email);
      
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      console.log('Raw settings before cleaning:', settings)
      const cleanedSettings = cleanUndefinedValues(settings)
      console.log('Cleaned settings to save:', cleanedSettings)
      
      const docRef = doc(db, SETTINGS_DOC_PATH)
      
      // Create or update the document with cleaned data
      await setDoc(docRef, cleanedSettings, { merge: true })
      
      // Verify the save
      const verifySnap = await getDoc(docRef)
      console.log('Settings saved successfully:', verifySnap.exists())
      
      if (!verifySnap.exists()) {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error updating API settings:', error)
      throw error
    }
  },

  async getMapboxKey(): Promise<string | undefined> {
    try {
      const settings = await this.getSettings()
      return settings.mapbox?.apiKey
    } catch (error) {
      console.error('Error getting Mapbox key:', error)
      return undefined
    }
  }
}                     