import { Context } from 'hono'
import { DocumentService } from '../../services/documentService'

export class DocumentEndpoints {
  constructor(private service: DocumentService) {}

  indexDocument = async (c: Context) => {
    try {
      const document = await c.req.json()
      const documentId = await this.service.indexDocument(document)
      return c.json({ id: documentId }, 200 as const)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 400 as const)
    }
  }

  getDocument = async (c: Context) => {
    try {
      const { id } = c.req.param()
      const document = await this.service.getDocument(id)
      if (!document) {
        return c.json({ error: 'Document not found' }, 404 as const)
      }
      return c.json(document, 200 as const)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 404 as const)
    }
  }

  deleteDocument = async (c: Context) => {
    try {
      const { id } = c.req.param()
      const deleted = await this.service.deleteDocument(id)
      if (!deleted) {
        return c.json({ error: 'Document not found' }, 404 as const)
      }
      return c.json({ success: true }, 200 as const)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 400 as const)
    }
  }

  searchDocuments = async (c: Context) => {
    try {
      const { query, limit } = await c.req.json()
      if (!query) {
        return c.json({ error: 'Query is required' }, 400 as const)
      }
      const results = await this.service.searchDocuments(query, limit)
      return c.json({ results }, 200 as const)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 400 as const)
    }
  }
}
