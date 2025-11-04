'use client';

import { useState, useEffect } from 'react';

interface Agent {
  agent_id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export function NodePalette() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.converto.fi';
      const response = await fetch(`${apiUrl}/api/v1/agent-orchestrator/agents`);
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-gray-600 dark:text-gray-400">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Agentit
      </h2>
      <div className="space-y-2">
        {agents.map((agent) => (
          <div
            key={agent.agent_id}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-move"
            draggable
          >
            <div className="font-medium text-sm text-gray-900 dark:text-white">
              {agent.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {agent.description}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 3).map((cap) => (
                <span
                  key={cap}
                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
