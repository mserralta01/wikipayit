/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
    readonly VITE_FIREBASE_MEASUREMENT_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

const getEnvVar = (key: keyof ImportMetaEnv): string => {
    const value = import.meta.env[key];
    if (!value) {
        console.error(`
⚠️ Missing environment variable: ${key}
Please check your .env.local file and make sure it contains:

${key}=your-value

Current environment variables found:
${Object.keys(import.meta.env)
    .filter(k => k.startsWith('VITE_'))
    .map(k => `${k}: ${import.meta.env[k] ? '✓ Present' : '✗ Missing'}`)
    .join('\n')}

Note: Make sure you have restarted your Vite dev server after adding environment variables.
`);
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

// Validate all required environment variables upfront
const validateEnvironmentVariables = () => {
    const requiredVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
        'VITE_FIREBASE_MEASUREMENT_ID'
    ] as const;

    const missingVars = requiredVars.filter(key => !import.meta.env[key]);

    if (missingVars.length > 0) {
        console.error(`
⚠️ Missing required environment variables:
${missingVars.join('\n')}

Please create a .env.local file in your project root with the following variables:

${requiredVars.map(key => `${key}=your-value`).join('\n')}

You can find these values in your Firebase Console:
1. Go to Project Settings (⚙️ icon)
2. Under "General" tab, scroll to "Your apps"
3. Find your web app or create a new one
4. Copy the values from the configuration object

Current environment variables found:
${Object.keys(import.meta.env)
    .filter(k => k.startsWith('VITE_'))
    .map(k => `${k}: ${import.meta.env[k] ? '✓ Present' : '✗ Missing'}`)
    .join('\n')}
`);
        throw new Error('Missing required environment variables');
    }
};

// Run validation
validateEnvironmentVariables();

// Debug: Log environment variables (redacted for security)
console.log('Environment Variables Check:', {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Present' : '✗ Missing',
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ Present' : '✗ Missing',
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Present' : '✗ Missing',
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✓ Present' : '✗ Missing',
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✓ Present' : '✗ Missing',
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? '✓ Present' : '✗ Missing',
    MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? '✓ Present' : '✗ Missing',
});

export const config = {
    firebase: {
        apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
        authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
        storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvVar('VITE_FIREBASE_APP_ID'),
        measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID'),
    } as FirebaseConfig
} as const;

// Debug: Log Firebase config (redacted for security)
console.log('Firebase Config Check:', {
    apiKey: '✓ Present',
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: '✓ Present',
    appId: '✓ Present',
    measurementId: '✓ Present',
}); 