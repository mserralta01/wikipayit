import { initializeApp } from 'firebase/app';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setCORS() {
  try {
    // Run Firebase CLI command
    const { stdout, stderr } = await execAsync('firebase storage:cors set cors.json');
    
    if (stderr) {
      console.error('Error:', stderr);
      return;
    }
    
    console.log('CORS configuration updated successfully:', stdout);
  } catch (error) {
    console.error('Failed to update CORS configuration:', error);
  }
}

setCORS(); 