export interface Document {
  id: string
  text: string
  metadata?: Record<string, any>
}

export interface SearchQuery {
  query: string
  limit?: number
}

export interface SearchResult {
  document: Document
  score: number
}

export interface DocumentRepository {
  save(indexName: string, document: Document): Promise<string>
  findById(indexName: string, id: string): Promise<Document | null>
  delete(indexName: string, id: string): Promise<boolean>
  search(indexName: string, query: SearchQuery): Promise<SearchResult[]>
}
