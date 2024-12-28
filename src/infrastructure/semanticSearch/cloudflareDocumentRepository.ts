import { Document } from '../../domain/document'
import { DocumentRepository } from '../../domain/documentRepository'
import { Env } from '../../types'
import { CloudflareSemanticSearchAdapter } from './cloudflareAdapter'

export class CloudflareDocumentRepository implements DocumentRepository {
  private readonly adapter: CloudflareSemanticSearchAdapter

  constructor(envOrAdapter: Env | CloudflareSemanticSearchAdapter) {
    this.adapter = envOrAdapter instanceof CloudflareSemanticSearchAdapter
      ? envOrAdapter
      : new CloudflareSemanticSearchAdapter(envOrAdapter)
  }

  async indexDocument(document: Document): Promise<string> {
    // Generate embedding for the document
    const embedding = await this.adapter.generateEmbedding(document.text)

    // Prepare flattened metadata with _ss_text
    const flatMetadata = {
      _ss_text: document.text,
      ...document.metadata
    }

    // Store document in vector store
    await this.adapter.upsertVector(document.id, embedding, flatMetadata)

    return document.id
  }

  async deleteDocuments(ids: string[]): Promise<boolean[]> {
    try {
      await this.adapter.deleteByIds(ids)
      return ids.map(() => true)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting documents:', error)
      return ids.map(() => false)
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    const results = await this.deleteDocuments([id])
    return results[0]
  }

  async getDocument(id: string): Promise<Document | null> {
    const result = await this.adapter.queryById(id)
    if (!result || !result.metadata) {
      return null
    }
    
    const { _ss_text, ...metadata } = result.metadata
    return {
      id: result.id,
      text: _ss_text,
      metadata
    }
  }

  async searchDocuments(query: string, limit?: number): Promise<Array<{ document: Document; score: number }>> {
    // Generate embedding for the query
    const queryEmbedding = await this.adapter.generateEmbedding(query)

    // Search for similar documents
    const matches = await this.adapter.query(queryEmbedding, limit)

    // Map results to documents
    return matches.map(match => {
      if (!match.metadata) {
        return {
          document: {
            id: match.id,
            text: '',
            metadata: {}
          },
          score: match.score
        }
      }
      const { _ss_text, ...metadata } = match.metadata
      return {
        document: {
          id: match.id,
          text: _ss_text,
          metadata
        },
        score: match.score
      }
    })
  }
}
