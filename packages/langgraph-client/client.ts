import type { LangGraphNode, LangGraphResult, LangGraphOptions, LangGraphRunRequest } from './types'

export class LangGraphClient {
  private apiKey: string
  private project: string
  private baseUrl: string

  constructor(options: LangGraphOptions) {
    this.apiKey = options.apiKey
    this.project = options.project
    this.baseUrl = options.baseUrl || 'https://api.langgraph.io/v1'
  }

  async run(nodes: LangGraphNode[], context: Record<string, any>): Promise<LangGraphResult[]> {
    const payload: LangGraphRunRequest = { nodes, context }
    const res = await fetch(`${this.baseUrl}/run`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-LangGraph-Project': this.project,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return [{ node: 'Custom', status: 'error', error: `HTTP ${res.status}` }]
    }

    const data = await res.json()
    return data.results as LangGraphResult[]
  }
}


