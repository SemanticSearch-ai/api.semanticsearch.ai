import { Context } from 'hono'
import { store } from '../store'

export function getDocument(c: Context) {
  const { indexName, id } = c.req.param()
  
  if (!store[indexName] || !store[indexName][id]) {
    return c.json({ error: 'Document not found' }, 404)
  }

  return c.json(store[indexName][id])
}
