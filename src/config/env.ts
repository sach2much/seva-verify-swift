export const ENV = {
  N8N_BASE_URL: import.meta.env.VITE_N8N_BASE_URL || 'https://placeholder.app.n8n.cloud/webhook',
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDmKlem75ZnIxeQpKbCgU5oOyJgwvJLe8Y',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'docverifyindia',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'docverifyindia.firebasestorage.app',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'docverifyindia.firebaseapp.com',
};
