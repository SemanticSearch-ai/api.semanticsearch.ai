import { nanoid } from 'nanoid'
import { Document, DocumentRepository, SearchQuery, SearchResult } from '../domain/document'

export class DocumentService {
  constructor(private repository: DocumentRepository) {}

  async indexDocument(indexName: string, data: Partial<Document>): Promise<string> {
    const document: Document = {
      id: data.id || nanoid(),
      text: data.text!,
      metadata: data.metadata || {}
    }

    if (!document.text) {
      throw new Error('text field is required')
    }

    return await this.repository.save(indexName, document)
  }

  async getDocument(indexName: string, id: string): Promise<Document> {
    const document = await this.repository.findById(indexName, id)
    if (!document) {
      throw new Error('Document not found')
    }
    return document
  }

  async deleteDocument(indexName: string, id: string): Promise<boolean> {
    return await this.repository.delete(indexName, id)
  }

  async searchDocuments(indexName: string, query: SearchQuery): Promise<SearchResult[]> {
    if (!query.query) {
      throw new Error('query is required')
    }
    return await this.repository.search(indexName, query)
  }
}
