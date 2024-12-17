import { Context } from 'hono'
import { nanoid } from 'nanoid'
import { store } from '../store'

interface Document {
  id: string
  text: string
  [key: string]: any
}

export async function indexDocument(c: Context) {
  const { indexName } = c.req.param()
  const body = await c.req.json()
  
  if (!store[indexName]) {
    store[indexName] = {}
  }

  const doc: Document = {
    id: body.id || nanoid(),
    text: body.text,
    ...body
  }

  // 确保必需字段存在
  if (!doc.text) {
    return c.json({ error: 'text field is required' }, 400)
  }

  store[indexName][doc.id] = doc

  return c.json({ id: doc.id })
}
