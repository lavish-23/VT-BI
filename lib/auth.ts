import { SignJWT, jwtVerify } from 'jose'

const AUTH_SECRET = process.env.AUTH_SECRET

if (!AUTH_SECRET) {
  throw new Error('Please define AUTH_SECRET in .env.local')
}

const secret = new TextEncoder().encode(AUTH_SECRET)

export type SessionPayload = {
  userId: string
  email: string
}

export async function createSession(payload: SessionPayload) {
  return await new SignJWT({
    userId: payload.userId,
    email: payload.email,
  })
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)

    return {
      userId: payload.userId as string,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}