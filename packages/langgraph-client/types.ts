export type LangGraphNode =
  | 'VisionOCR'
  | 'VATCalc'
  | 'StripeInvoice'
  | 'AuditLog'
  | 'Custom'

export interface LangGraphResult {
  node: LangGraphNode
  status: 'success' | 'error'
  data?: any
  error?: string
}

export interface LangGraphOptions {
  apiKey: string
  project: string
  baseUrl?: string
}

export interface LangGraphRunRequest {
  nodes: LangGraphNode[]
  context: Record<string, any>
}


