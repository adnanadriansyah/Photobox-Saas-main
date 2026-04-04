import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'snapnext-secret'
const COOKIE_NAME = 'snapnext_token'

export interface AuthTokenPayload {
  userId: string
  email: string
  role: string
  tenantId: string
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
}

export function getAuthCookieName() {
  return COOKIE_NAME
}
