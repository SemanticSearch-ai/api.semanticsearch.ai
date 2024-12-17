import { Context } from 'hono'
import { store } from '../store'

export function deleteDocument(c: Context) {
  const { indexName, id } = c.req.param()
  
  if (!store[indexName] || !store[indexName][id]) {
    return c.json({ error: 'Document not found' }, 404)
  }

  delete store[indexName][id]
  return c.json({ success: true })
}
