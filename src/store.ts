interface Document {
  id: string
  text: string
  [key: string]: any
}

// Mock 存储
export const store: Record<string, Record<string, Document>> = {}
