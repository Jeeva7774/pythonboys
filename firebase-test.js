// Simple Firebase test
import { auth } from './src/services/firebaseConfig';

console.log('Testing Firebase Auth...');
console.log('Auth instance:', auth);
console.log('Auth app:', auth?.app);
console.log('Auth config:', auth?.config);

if (auth) {
  console.log('✅ Firebase Auth is properly initialized');
} else {
  console.log('❌ Firebase Auth failed to initialize');
}
