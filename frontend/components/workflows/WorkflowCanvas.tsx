'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowCanvasProps {
  templateId: string;
}

export function WorkflowCanvas({ templateId }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflowTemplate(templateId);
  }, [templateId]);

  const loadWorkflowTemplate = async (templateId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.converto.fi';
      const response = await fetch(`${apiUrl}/api/v1/agent-orchestrator/templates`);
      if (response.ok) {
        const templates = await response.json();
        const template = templates.find((t: any) => t.template_id === templateId);

        if (template) {
          // Convert template steps to React Flow nodes
          const workflowNodes: Node[] = template.steps?.map((step: any, index: number) => ({
            id: step.step_id || `step-${index}`,
            type: 'default',
            position: { x: index * 250, y: 100 },
            data: {
              label: (
                <div>
                  <div className="font-semibold">{step.agent_id}</div>
                  <div className="text-xs text-gray-500">{step.step_id}</div>
                </div>
              ),
            },
          })) || [];

          // Convert dependencies to edges
          const workflowEdges: Edge[] = [];
          template.steps?.forEach((step: any, index: number) => {
            step.dependencies?.forEach((depId: string) => {
              workflowEdges.push({
                id: `${depId}-${step.step_id}`,
                source: depId,
                target: step.step_id || `step-${index}`,
                type: 'smoothstep',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              });
            });
          });

          setNodes(workflowNodes);
          setEdges(workflowEdges);
        }
      }
    } catch (error) {
      console.error('Failed to load workflow template:', error);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-gray-600 dark:text-gray-400">Ladataan workflowta...</div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
