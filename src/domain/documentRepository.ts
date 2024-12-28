import { Document } from './document'

export interface DocumentRepository {
  indexDocument(document: Document): Promise<string>
  getDocument(id: string): Promise<Document | null>
  deleteDocuments(ids: string[]): Promise<boolean[]>
  deleteDocument(id: string): Promise<boolean>
  searchDocuments(query: string, limit?: number): Promise<Array<{ document: Document; score: number }>>
}
