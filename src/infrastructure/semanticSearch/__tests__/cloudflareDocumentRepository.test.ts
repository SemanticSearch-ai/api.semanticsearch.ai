import { CloudflareDocumentRepository } from '../cloudflareDocumentRepository'
import { CloudflareSemanticSearchAdapter } from '../cloudflareAdapter'
import { Document } from '../../../domain/document'
import { Env } from '../../../types'

jest.mock('../cloudflareAdapter')

describe('CloudflareDocumentRepository', () => {
  let repository: CloudflareDocumentRepository
  let mockAdapter: CloudflareSemanticSearchAdapter

  beforeEach(() => {
    mockAdapter = new CloudflareSemanticSearchAdapter({} as Env)
    jest.spyOn(mockAdapter, 'generateEmbedding').mockImplementation(jest.fn())
    jest.spyOn(mockAdapter, 'upsertVector').mockImplementation(jest.fn())
    jest.spyOn(mockAdapter, 'deleteByIds').mockImplementation(jest.fn())
    jest.spyOn(mockAdapter, 'query').mockImplementation(jest.fn())
    jest.spyOn(mockAdapter, 'queryById').mockImplementation(jest.fn())

    repository = new CloudflareDocumentRepository(mockAdapter)
  })

  describe('indexDocument', () => {
    it('should index document and return id', async () => {
      const document: Document = {
        id: 'test-id',
        text: 'test text'
      }

      const embedding = [0.1, 0.2, 0.3]
      jest.spyOn(mockAdapter, 'generateEmbedding').mockResolvedValue(embedding)

      const result = await repository.indexDocument(document)

      expect(result).toBe(document.id)
      expect(mockAdapter.generateEmbedding).toHaveBeenCalledWith(document.text)
      expect(mockAdapter.upsertVector).toHaveBeenCalledWith(document.id, embedding, {
        _ss_text: document.text
      })
    })

    it('should handle adapter errors', async () => {
      const document: Document = {
        id: 'test-id',
        text: 'test text'
      }

      const error = new Error('Adapter error')
      jest.spyOn(mockAdapter, 'generateEmbedding').mockRejectedValue(error)

      await expect(repository.indexDocument(document)).rejects.toThrow('Adapter error')
    })
  })

  describe('getDocument', () => {
    it('should return document if exists', async () => {
      const document = {
        id: 'test-id',
        text: 'test text'
      }

      ;(mockAdapter.queryById as jest.Mock).mockResolvedValue({
        id: document.id,
        score: 1,
        metadata: {
          _ss_text: document.text
        }
      })

      const result = await repository.getDocument(document.id)
      expect(result).toEqual({
        id: document.id,
        text: document.text,
        metadata: {}
      })
      expect(mockAdapter.queryById).toHaveBeenCalledWith(document.id)
    })

    it('should return null if document does not exist', async () => {
      jest.spyOn(mockAdapter, 'queryById').mockResolvedValue(null)
      
      const result = await repository.getDocument('non-existent-id')
      expect(result).toBeNull()
      expect(mockAdapter.queryById).toHaveBeenCalledWith('non-existent-id')
    })
  })

  describe('deleteDocument', () => {
    it('should delete document and return true', async () => {
      const document = { id: 'test-id', text: 'test text' }
      ;(mockAdapter.deleteByIds as jest.Mock).mockResolvedValue(undefined)

      const result = await repository.deleteDocument(document.id)

      expect(result).toBe(true)
      expect(mockAdapter.deleteByIds).toHaveBeenCalledWith([document.id])
    })

    it('should return false if adapter throws error', async () => {
      ;(mockAdapter.deleteByIds as jest.Mock).mockRejectedValue(new Error('Delete error'))
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = await repository.deleteDocument('non-existent-id')
      expect(result).toBe(false)
      expect(mockAdapter.deleteByIds).toHaveBeenCalledWith(['non-existent-id'])
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('searchDocuments', () => {
    it('should search documents and return results', async () => {
      const documents = [
        { id: 'doc1', text: 'first document' },
        { id: 'doc2', text: 'second document' }
      ]

      const queryEmbedding = [0.1, 0.2, 0.3]
      jest.spyOn(mockAdapter, 'generateEmbedding').mockResolvedValue(queryEmbedding)

      ;(mockAdapter.query as jest.Mock).mockResolvedValue([
        {
          id: documents[0].id,
          score: 0.9,
          metadata: {
            _ss_text: documents[0].text
          }
        },
        {
          id: documents[1].id,
          score: 0.8,
          metadata: {
            _ss_text: documents[1].text
          }
        }
      ])

      const results = await repository.searchDocuments('search query', 2)

      expect(mockAdapter.generateEmbedding).toHaveBeenCalledWith('search query')
      expect(mockAdapter.query).toHaveBeenCalledWith(queryEmbedding, 2)
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({
        document: {
          id: documents[0].id,
          text: documents[0].text,
          metadata: {}
        },
        score: 0.9
      })
      expect(results[1]).toEqual({
        document: {
          id: documents[1].id,
          text: documents[1].text,
          metadata: {}
        },
        score: 0.8
      })
    })

    it('should handle adapter errors', async () => {
      const error = new Error('Search error')
      jest.spyOn(mockAdapter, 'generateEmbedding').mockRejectedValue(error)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      await expect(repository.searchDocuments('search query')).rejects.toThrow('Search error')
      
      consoleErrorSpy.mockRestore()
    })
  })
})
