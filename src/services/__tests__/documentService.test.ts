import { DocumentService } from '../documentService'
import { InMemoryDocumentRepository } from '../../infrastructure/test/inMemoryDocumentRepository'
import { Document, SearchQuery } from '../../domain/document'

describe('DocumentService', () => {
  let service: DocumentService
  let repository: InMemoryDocumentRepository

  beforeEach(() => {
    repository = new InMemoryDocumentRepository()
    service = new DocumentService(repository)
  })

  describe('indexDocument', () => {
    it('should create a document with generated id', async () => {
      const data = { text: 'test document' }
      const id = await service.indexDocument('test-index', data)
      expect(id).toBeTruthy()

      const document = await repository.findById('test-index', id)
      expect(document).toBeTruthy()
      expect(document!.text).toBe(data.text)
    })

    it('should use provided id', async () => {
      const data = { id: 'test-id', text: 'test document' }
      const id = await service.indexDocument('test-index', data)
      expect(id).toBe('test-id')
    })

    it('should throw error if text is missing', async () => {
      const data = { id: 'test-id' } as any
      await expect(service.indexDocument('test-index', data))
        .rejects
        .toThrow('text field is required')
    })
  })

  describe('getDocument', () => {
    it('should retrieve existing document', async () => {
      const data: Document = {
        id: 'test-id',
        text: 'test document'
      }
      await repository.save('test-index', data)

      const document = await service.getDocument('test-index', 'test-id')
      expect(document).toEqual(data)
    })

    it('should throw error for non-existent document', async () => {
      await expect(service.getDocument('test-index', 'non-existent'))
        .rejects
        .toThrow('Document not found')
    })
  })

  describe('deleteDocument', () => {
    it('should delete existing document', async () => {
      const data: Document = {
        id: 'test-id',
        text: 'test document'
      }
      await repository.save('test-index', data)

      const result = await service.deleteDocument('test-index', 'test-id')
      expect(result).toBe(true)

      const document = await repository.findById('test-index', 'test-id')
      expect(document).toBeNull()
    })

    it('should return false for non-existent document', async () => {
      const result = await service.deleteDocument('test-index', 'non-existent')
      expect(result).toBe(false)
    })
  })

  describe('searchDocuments', () => {
    beforeEach(async () => {
      // 添加一些测试文档
      await repository.save('test-index', {
        id: '1',
        text: 'first test document'
      })
      await repository.save('test-index', {
        id: '2',
        text: 'second test document'
      })
    })

    it('should return search results', async () => {
      const results = await service.searchDocuments('test-index', {
        query: 'test',
        limit: 5
      })

      expect(results).toHaveLength(2)
      results.forEach(result => {
        expect(result.document).toBeTruthy()
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(1)
      })
    })

    it('should throw error if query is missing', async () => {
      const query = { limit: 5 } as SearchQuery
      await expect(service.searchDocuments('test-index', query))
        .rejects
        .toThrow('query is required')
    })
  })
})
