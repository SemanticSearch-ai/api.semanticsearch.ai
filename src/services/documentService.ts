import * as crypto from 'crypto'
import { Document } from '../domain/document'
import { DocumentRepository } from '../domain/documentRepository'

export class DocumentService {
  constructor(private repository: DocumentRepository) {}

  async indexDocument(data: Partial<Document>): Promise<string> {
    if (!data.text) {
      throw new Error('Document text is required')
    }

    const document: Document = {
      id: data.id || crypto.randomUUID(),
      text: data.text,
      metadata: data.metadata,
    }

    return await this.repository.indexDocument(document)
  }

  async getDocument(id: string): Promise<Document | null> {
    return await this.repository.getDocument(id)
  }

  async deleteDocuments(ids: string[]): Promise<boolean[]> {
    return await this.repository.deleteDocuments(ids)
  }

  async deleteDocument(id: string): Promise<boolean> {
    return await this.repository.deleteDocument(id)
  }

  async searchDocuments(query: string, limit?: number): Promise<Array<{ document: Document; score: number }>> {
    return await this.repository.searchDocuments(query, limit)
  }
}
