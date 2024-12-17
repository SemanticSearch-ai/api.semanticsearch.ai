import { Context } from 'hono'
import { store } from '../store'

interface SearchQuery {
  query: string
  limit?: number
}

interface SearchResult {
  id: string
  text: string
  score: number
  [key: string]: any
}

export async function searchDocuments(c: Context) {
  const { indexName } = c.req.param()
  const body: SearchQuery = await c.req.json()
  
  if (!store[indexName]) {
    return c.json({ error: 'Index not found' }, 404)
  }

  if (!body.query) {
    return c.json({ error: 'query is required' }, 400)
  }

  // Mock 搜索结果
  const results: SearchResult[] = Object.values(store[indexName])
    .map(doc => ({
      ...doc,
      score: Math.random()  // Mock 相似度分数
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, body.limit || 10)

  return c.json({ results })
}
