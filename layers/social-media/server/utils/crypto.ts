import * as crypto from 'crypto'

// PKCE code verifier and challenge generator
export const getCrypto = () => {
  // Generate a random code verifier
  const generateCodeVerifier = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let result = ''
    const randomBytes = crypto.randomBytes(64)
    for (let i = 0; i < 64; i++) {
      const randomIndex = randomBytes[i] % characters.length
      result += characters.charAt(randomIndex)
    }
    return result
  }

  // Generate code challenge from verifier (SHA256)
  const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const hash = crypto.createHash('sha256')
    hash.update(verifier)
    return hash.digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  // Encrypt sensitive data
  const encrypt = (text: string): string => {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key'
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return `${iv.toString('hex')}:${encrypted}`
  }

  // Decrypt sensitive data
  const decrypt = (text: string): string => {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key'
    const [ivString, encryptedString] = text.split(':')
    const iv = Buffer.from(ivString, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedString, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  return {
    generateCodeVerifier,
    generateCodeChallenge,
    encrypt,
    decrypt
  }
}