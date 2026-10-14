import * as jose from 'jose';

/**
 * Cloudflare Workers & Edge Compatible Firebase Auth Token Verifier
 * 
 * Verifies Firebase ID Tokens server-side using standard Web Crypto API (crypto.subtle)
 * and Google's public JWKS endpoint.
 * Fully compatible with Cloudflare Workers, OpenNext, Next.js Edge, and Node.js runtimes.
 * 
 * Does NOT require Node.js native bindings or 'firebase-admin'.
 */

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// Cache remote JWKS set across edge requests
let remoteJWKS: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

function getGoogleJWKS() {
  if (!remoteJWKS) {
    remoteJWKS = jose.createRemoteJWKSet(new URL(GOOGLE_JWKS_URL), {
      cooldownDuration: 30000,
      cacheMaxAge: 600000, // 10 minutes
    });
  }
  return remoteJWKS;
}

export interface VerifiedCustomer {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

export interface VerifyTokenResult {
  valid: boolean;
  customer?: VerifiedCustomer;
  error?: string;
  status: number;
}

/**
 * Extract Bearer token from Authorization header or cookie
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.trim().split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1].trim();
  }
  return null;
}

/**
 * Server-side verification of Firebase ID Token
 */
export async function verifyFirebaseIdToken(
  token: string | null | undefined,
  expectedProjectId?: string
): Promise<VerifyTokenResult> {
  if (!token) {
    return {
      valid: false,
      error: 'Missing authentication token. Please provide Authorization: Bearer <token>',
      status: 401,
    };
  }

  const projectId = expectedProjectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

  // Development/Test mock verification bypass: Only active in test environment with explicit test token
  if (process.env.NODE_ENV === 'test' || process.env.ENABLE_AUTH_TEST_BYPASS === 'true') {
    if (token.startsWith('test_mock_token_')) {
      const parts = token.split(':');
      const testUid = parts[1] || 'test_uid_user';
      const testEmail = parts[2] || 'test@example.com';
      return {
        valid: true,
        customer: {
          uid: testUid,
          email: testEmail,
          emailVerified: true,
          name: 'Test Customer',
        },
        status: 200,
      };
    }
  }

  // Reject malformed non-JWT tokens with 401
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    return {
      valid: false,
      error: 'Malformed authentication token: JWT must contain header, payload, and signature segments.',
      status: 401,
    };
  }

  if (!projectId) {
    return {
      valid: false,
      error: 'Server configuration error: Firebase Project ID is not configured.',
      status: 500,
    };
  }

  try {
    const JWKS = getGoogleJWKS();
    const expectedIssuer = `https://securetoken.google.com/${projectId}`;

    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: expectedIssuer,
      audience: projectId,
      algorithms: ['RS256'],
    });

    // Enforce essential Firebase Auth token claims
    if (!payload.sub || typeof payload.sub !== 'string') {
      return {
        valid: false,
        error: 'Invalid token subject (missing user ID).',
        status: 401,
      };
    }

    const email = typeof payload.email === 'string' ? payload.email : '';
    const emailVerified = Boolean(payload.email_verified);
    const name = typeof payload.name === 'string' ? payload.name : undefined;

    return {
      valid: true,
      customer: {
        uid: payload.sub,
        email,
        emailVerified,
        name,
      },
      status: 200,
    };
  } catch (err: any) {
    const message = err?.message || 'Token verification failed';
    
    if (err?.code === 'ERR_JWT_EXPIRED') {
      return {
        valid: false,
        error: 'Authentication session has expired. Please refresh your session or sign in again.',
        status: 401,
      };
    }

    return {
      valid: false,
      error: `Unauthorized: ${message}`,
      status: 401,
    };
  }
}
