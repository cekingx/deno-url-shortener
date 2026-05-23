import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = Deno.env.get('JWT_SECRET')
  if (!secret) throw new Error('JWT_SECRET environment variable is required')
  return new TextEncoder().encode(secret)
}

export async function signJwt(userId: number): Promise<string> {
  return await new SignJWT({ sub: userId.toString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyJwt(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as { sub: string }
}
