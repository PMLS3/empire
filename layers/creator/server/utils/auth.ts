import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

export interface DecodedToken {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    isAdmin?: boolean;
  };
  workspace: {
    id: string;
    name: string;
  };
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<DecodedToken> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as DecodedToken);
      }
    });
  });
}

/**
 * Generate a new JWT token
 */
export function generateToken(payload: DecodedToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Refresh an existing token with a new expiration
 */
export async function refreshToken(token: string): Promise<string> {
  // Verify the existing token first
  const decoded = await verifyToken(token);
  
  // Generate a fresh token with the same payload
  return generateToken(decoded);
}
