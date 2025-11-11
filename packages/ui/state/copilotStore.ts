import { create } from 'zustand'

type Suggestion = {
  id: string
  title: string
  action: 'create_invoice' | 'categorize' | 'reconcile' | 'custom'
  payload?: Record<string, unknown>
}

type CoPilotState = {
  isOpen: boolean
  context: Record<string, unknown> | null
  setContext: (ctx: Record<string, unknown> | null) => void
  open: () => void
  close: () => void
  toggle: () => void
  lastSuggestions: Suggestion[]
  setSuggestions: (s: Suggestion[]) => void
  connectionType: 'sse' | 'ws' | 'offline'
  setConnectionType: (t: 'sse' | 'ws' | 'offline') => void
}

export const useCoPilotStore = create<CoPilotState>((set) => ({
  isOpen: false,
  context: null,
  setContext: (ctx) => set({ context: ctx }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  lastSuggestions: [],
  setSuggestions: (s) => set({ lastSuggestions: s }),
  connectionType: 'offline',
  setConnectionType: (t) => set({ connectionType: t })
}))

export type { Suggestion }

