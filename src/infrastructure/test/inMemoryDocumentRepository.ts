import { Document, DocumentRepository, SearchQuery, SearchResult } from '../../domain/document'

export class InMemoryDocumentRepository implements DocumentRepository {
  private store: Record<string, Record<string, Document>> = {}

  async save(indexName: string, document: Document): Promise<string> {
    if (!this.store[indexName]) {
      this.store[indexName] = {}
    }
    this.store[indexName][document.id] = document
    return document.id
  }

  async findById(indexName: string, id: string): Promise<Document | null> {
    if (!this.store[indexName] || !this.store[indexName][id]) {
      return null
    }
    return this.store[indexName][id]
  }

  async delete(indexName: string, id: string): Promise<boolean> {
    if (!this.store[indexName] || !this.store[indexName][id]) {
      return false
    }
    delete this.store[indexName][id]
    return true
  }

  async search(indexName: string, query: SearchQuery): Promise<SearchResult[]> {
    if (!this.store[indexName]) {
      return []
    }

    return Object.values(this.store[indexName])
      .map(document => ({
        document,
        score: Math.random() // Mock similarity score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 10)
  }
}
