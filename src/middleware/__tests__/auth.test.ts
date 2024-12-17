import { Context } from 'hono'
import { auth } from '../auth'

describe('Auth Middleware', () => {
  let mockContext: Partial<Context>
  const env = { API_KEY: 'test-api-key' }

  beforeEach(() => {
    mockContext = {
      env,
      req: {
        header: jest.fn()
      } as any,
      json: jest.fn(),
    }
  })

  it('should allow request with valid bearer token', async () => {
    ;(mockContext.req!.header as jest.Mock).mockReturnValue(`Bearer ${env.API_KEY}`)
    const next = jest.fn()

    await auth()(mockContext as Context, next)

    expect(next).toHaveBeenCalled()
    expect(mockContext.json).not.toHaveBeenCalled()
  })

  it('should reject request with invalid bearer token', async () => {
    ;(mockContext.req!.header as jest.Mock).mockReturnValue('Bearer invalid-token')
    const next = jest.fn()

    await auth()(mockContext as Context, next)

    expect(next).not.toHaveBeenCalled()
    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Unauthorized' },
      401
    )
  })

  it('should reject request with missing authorization header', async () => {
    ;(mockContext.req!.header as jest.Mock).mockReturnValue(null)
    const next = jest.fn()

    await auth()(mockContext as Context, next)

    expect(next).not.toHaveBeenCalled()
    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Unauthorized' },
      401
    )
  })

  it('should reject request with non-bearer authorization', async () => {
    ;(mockContext.req!.header as jest.Mock).mockReturnValue('Basic sometoken')
    const next = jest.fn()

    await auth()(mockContext as Context, next)

    expect(next).not.toHaveBeenCalled()
    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Unauthorized' },
      401
    )
  })
})
