import { Context, MiddlewareHandler } from 'hono'

export const auth = (): MiddlewareHandler => {
  return async (c: Context, next) => {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const [scheme, token] = authHeader.split(' ')
    
    if (scheme !== 'Bearer') {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const apiKey = c.env.API_KEY
    if (!apiKey || token !== apiKey) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await next()
  }
}
