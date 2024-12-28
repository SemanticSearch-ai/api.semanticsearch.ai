import { DocumentService } from '../documentService'
import { Document } from '../../domain/document'
import { DocumentRepository } from '../../domain/documentRepository'

describe('DocumentService', () => {
  let service: DocumentService
  let mockRepository: jest.Mocked<DocumentRepository>

  beforeEach(() => {
    mockRepository = {
      indexDocument: jest.fn(),
      getDocument: jest.fn(),
      deleteDocument: jest.fn(),
      deleteDocuments: jest.fn(),
      searchDocuments: jest.fn()
    }
    service = new DocumentService(mockRepository)
  })

  describe('indexDocument', () => {
    it('should index document with generated id', async () => {
      const data = {
        text: 'test document'
      }

      mockRepository.indexDocument.mockResolvedValue('generated-id')

      const id = await service.indexDocument(data)

      expect(id).toBe('generated-id')
      expect(mockRepository.indexDocument).toHaveBeenCalledWith(expect.objectContaining({
        text: data.text
      }))
    })

    it('should use provided id if available', async () => {
      const data = {
        id: 'custom-id',
        text: 'test document'
      }

      mockRepository.indexDocument.mockResolvedValue(data.id)

      const id = await service.indexDocument(data)

      expect(id).toBe(data.id)
      expect(mockRepository.indexDocument).toHaveBeenCalledWith(expect.objectContaining({
        id: data.id,
        text: data.text
      }))
    })

    it('should throw error if text is missing', async () => {
      const data = {
        id: 'test-id'
      }

      await expect(service.indexDocument(data)).rejects.toThrow('Document text is required')
      expect(mockRepository.indexDocument).not.toHaveBeenCalled()
    })
  })

  describe('getDocument', () => {
    it('should return document if exists', async () => {
      const document: Document = {
        id: 'test-id',
        text: 'test document'
      }

      mockRepository.getDocument.mockResolvedValue(document)

      const result = await service.getDocument('test-id')

      expect(result).toEqual(document)
      expect(mockRepository.getDocument).toHaveBeenCalledWith('test-id')
    })

    it('should return null if document does not exist', async () => {
      mockRepository.getDocument.mockResolvedValue(null)

      const result = await service.getDocument('non-existent')

      expect(result).toBeNull()
      expect(mockRepository.getDocument).toHaveBeenCalledWith('non-existent')
    })
  })

  describe('deleteDocument', () => {
    it('should delete document and return true', async () => {
      mockRepository.deleteDocument.mockResolvedValue(true)

      const result = await service.deleteDocument('test-id')

      expect(result).toBe(true)
      expect(mockRepository.deleteDocument).toHaveBeenCalledWith('test-id')
    })

    it('should return false if document does not exist', async () => {
      mockRepository.deleteDocument.mockResolvedValue(false)

      const result = await service.deleteDocument('non-existent')

      expect(result).toBe(false)
      expect(mockRepository.deleteDocument).toHaveBeenCalledWith('non-existent')
    })
  })

  describe('searchDocuments', () => {
    it('should search documents with limit', async () => {
      const documents = [
        { id: 'doc1', text: 'first document' },
        { id: 'doc2', text: 'second document' }
      ]

      const searchResults = documents.map((document, index) => ({
        document,
        score: 1 - index * 0.1
      }))

      mockRepository.searchDocuments.mockResolvedValue(searchResults)

      const results = await service.searchDocuments('test query', 5)

      expect(results).toEqual(searchResults)
      expect(mockRepository.searchDocuments).toHaveBeenCalledWith('test query', 5)
    })

    it('should search documents without limit', async () => {
      mockRepository.searchDocuments.mockResolvedValue([])

      await service.searchDocuments('test query')

      expect(mockRepository.searchDocuments).toHaveBeenCalledWith('test query', undefined)
    })
  })
})
