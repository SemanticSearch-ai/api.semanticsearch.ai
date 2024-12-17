import { Context } from 'hono'
import { DocumentService } from '../../services/documentService'

export class DocumentEndpoints {
  constructor(private service: DocumentService) {}

  indexDocument = async (c: Context) => {
    try {
      const { indexName } = c.req.param()
      const body = await c.req.json()
      const id = await this.service.indexDocument(indexName, body)
      return c.json({ id })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: message }, 400)
    }
  }

  getDocument = async (c: Context) => {
    try {
      const { indexName, id } = c.req.param()
      const document = await this.service.getDocument(indexName, id)
      return c.json(document)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: message }, 404)
    }
  }

  deleteDocument = async (c: Context) => {
    try {
      const { indexName, id } = c.req.param()
      const success = await this.service.deleteDocument(indexName, id)
      if (!success) {
        return c.json({ error: 'Document not found' }, 404)
      }
      return c.json({ success })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: message }, 400)
    }
  }

  searchDocuments = async (c: Context) => {
    try {
      const { indexName } = c.req.param()
      const query = await c.req.json()
      const results = await this.service.searchDocuments(indexName, query)
      return c.json({ results })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: message }, 400)
    }
  }
}
