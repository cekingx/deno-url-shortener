import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verifyJwt } from '../utils/jwt.ts'

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, 'token')
  if (!token) return c.redirect('/login', 302)

  try {
    const payload = await verifyJwt(token)
    c.set('userId', payload.sub)
    await next()
  } catch {
    return c.redirect('/login', 302)
  }
}
