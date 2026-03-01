export const ENV = {
  N8N_BASE_URL: import.meta.env.VITE_N8N_BASE_URL || 'https://placeholder.app.n8n.cloud/webhook',
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'docverify-india',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'docverify-india.appspot.com',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'docverify-india.firebaseapp.com',
};
