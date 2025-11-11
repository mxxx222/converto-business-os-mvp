export * from './state/copilotStore'
export * from './copilot/CoPilotDrawer'
import React from 'react'

export function Button({ label }: { label: string }) {
  return (
    <button className="px-3 py-2 rounded-md bg-black text-white hover:bg-gray-800">
      {label}
    </button>
  )
}


