import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import { DocumentEndpoints } from './application/endpoints/documentEndpoints'
import { DocumentService } from './services/documentService'
import { InMemoryDocumentRepository } from './infrastructure/test/inMemoryDocumentRepository'
import { auth } from './middleware/auth'

const app = new OpenAPIHono()

// 初始化依赖
const repository = new InMemoryDocumentRepository()
const service = new DocumentService(repository)
const endpoints = new DocumentEndpoints(service)

// 启用 CORS
app.use('/*', cors())

// 启用认证
app.use('/v1/*', auth())

// API Schema 定义
const documentSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  metadata: z.record(z.any()).optional()
})

const searchQuerySchema = z.object({
  query: z.string(),
  limit: z.number().optional()
})

const searchResultSchema = z.object({
  results: z.array(z.object({
    document: documentSchema,
    score: z.number()
  }))
})

// 注册路由
const indexRoute = createRoute({
  method: 'post',
  path: '/v1/index/{indexName}',
  request: {
    params: z.object({
      indexName: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: documentSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string()
          })
        }
      },
      description: 'Document indexed successfully'
    }
  }
})

const getDocumentRoute = createRoute({
  method: 'get',
  path: '/v1/index/{indexName}/{id}',
  request: {
    params: z.object({
      indexName: z.string(),
      id: z.string()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: documentSchema
        }
      },
      description: 'Document retrieved successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: 'Document not found'
    }
  }
})

const deleteDocumentRoute = createRoute({
  method: 'delete',
  path: '/v1/index/{indexName}/{id}',
  request: {
    params: z.object({
      indexName: z.string(),
      id: z.string()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean()
          })
        }
      },
      description: 'Document deleted successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: 'Document not found'
    }
  }
})

const searchRoute = createRoute({
  method: 'post',
  path: '/v1/search/{indexName}',
  request: {
    params: z.object({
      indexName: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: searchQuerySchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: searchResultSchema
        }
      },
      description: 'Search completed successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      },
      description: 'Index not found'
    }
  }
})

app.openapi(indexRoute, endpoints.indexDocument)
app.openapi(getDocumentRoute, endpoints.getDocument)
app.openapi(deleteDocumentRoute, endpoints.deleteDocument)
app.openapi(searchRoute, endpoints.searchDocuments)

// 添加 Swagger UI
app.doc('/swagger.json', {
  openapi: '3.0.0',
  info: {
    title: 'Semantic Search API',
    version: '1.0.0',
    description: 'API for semantic search functionality'
  },
  security: [{
    bearerAuth: []
  }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    }
  }
})

app.get('/', swaggerUI({ url: '/swagger.json' }))

export default app
