import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  inMemoryPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { verifyFirebaseIdToken } from '../src/lib/auth/serverAuth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDIsHh1RJ7ztj_groWSw0FYjWlfGRYkT2c',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'meeshop-de48e.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'meeshop-de48e',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'meeshop-de48e.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '102818615548',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:102818615548:web:6138568e425a93e2ceebf9',
};

let total = 0;
let passed = 0;

function assert(condition: boolean, title: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ ${title}: PASSED`);
  } else {
    console.error(`❌ ${title}: FAILED - ${detail || ''}`);
    process.exitCode = 1;
  }
}

async function runLiveFirebaseTests() {
  console.log('========================================================================');
  console.log('SORAYVA — LIVE FIREBASE AUTH INTEGRATION TESTS (PROJECT: meeshop-de48e)');
  console.log('========================================================================\n');

  const app = initializeApp(firebaseConfig, `live-test-app-${Date.now()}`);
  const auth = initializeAuth(app, { persistence: inMemoryPersistence });

  const testEmail = `patron.live.${Date.now()}@example.com`;
  const testPassword = 'Password@Live2026!';

  // --- 1. USER REGISTRATION ---
  console.log('--- 1. Testing Live Registration ---');
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    assert(Boolean(userCredential.user.uid), 'Test 1.1: Live account created with UID', userCredential.user.uid);
    assert(userCredential.user.email === testEmail, 'Test 1.2: User email matches registration email');
  } catch (err: any) {
    assert(false, 'Test 1.1: Live account created with UID', err.message);
  }

  // --- 2. ID TOKEN ACQUISITION & SERVER VERIFICATION ---
  console.log('\n--- 2. Testing ID Token Acquisition & Edge Server Verification ---');
  if (userCredential) {
    try {
      const idToken = await userCredential.user.getIdToken();
      assert(Boolean(idToken && idToken.split('.').length === 3), 'Test 2.1: Live Firebase ID token acquired (3-part JWT)');

      // Verify token with our Edge serverAuth against Google's public JWKS
      const verifyResult = await verifyFirebaseIdToken(idToken, 'meeshop-de48e');
      assert(verifyResult.valid === true, 'Test 2.2: Live ID token verified by Edge serverAuth via Google JWKS');
      assert(verifyResult.customer?.uid === userCredential.user.uid, 'Test 2.3: Verified customer UID matches registered UID');
      assert(verifyResult.customer?.email === testEmail, 'Test 2.4: Verified customer email matches registered email');
    } catch (err: any) {
      assert(false, 'Test 2.1: ID Token Verification', err.message);
    }
  }

  // --- 3. DUPLICATE REGISTRATION REJECTION ---
  console.log('\n--- 3. Testing Duplicate Registration Rejection ---');
  try {
    await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    assert(false, 'Test 3.1: Duplicate registration should be rejected');
  } catch (err: any) {
    assert(err.code === 'auth/email-already-in-use', 'Test 3.1: Duplicate registration correctly rejected with auth/email-already-in-use');
  }

  // --- 4. SIGN OUT ---
  console.log('\n--- 4. Testing Sign Out ---');
  try {
    await signOut(auth);
    assert(true, 'Test 4.1: Signed out successfully');
  } catch (err: any) {
    assert(false, 'Test 4.1: Sign out failed', err.message);
  }

  // --- 5. SIGN IN WITH VALID CREDENTIALS ---
  console.log('\n--- 5. Testing Sign In with Valid Credentials ---');
  try {
    const signInResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    assert(signInResult.user.email === testEmail, 'Test 5.1: Signed in successfully with registered credentials');
  } catch (err: any) {
    assert(false, 'Test 5.1: Sign in with valid credentials', err.message);
  }

  // --- 6. SIGN IN WITH INCORRECT PASSWORD ---
  console.log('\n--- 6. Testing Sign In with Incorrect Password ---');
  try {
    await signInWithEmailAndPassword(auth, testEmail, 'WrongPassword123!');
    assert(false, 'Test 6.1: Sign in with wrong password should fail');
  } catch (err: any) {
    assert(
      err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential',
      'Test 6.1: Sign in with wrong password rejected with invalid-credential/wrong-password'
    );
  }

  // --- 7. PASSWORD RESET REQUEST ---
  console.log('\n--- 7. Testing Password Reset Request ---');
  try {
    await sendPasswordResetEmail(auth, testEmail);
    assert(true, 'Test 7.1: Password reset request dispatched successfully');
  } catch (err: any) {
    assert(false, 'Test 7.1: Password reset request failed', err.message);
  }

  console.log('\n========================================================================');
  console.log(`LIVE FIREBASE TEST RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================================\n');

  if (passed !== total) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveFirebaseTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
