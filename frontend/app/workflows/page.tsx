'use client';

import { useEffect, useState } from 'react';
import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas';
import { NodePalette } from '@/components/workflows/NodePalette';
import { WorkflowTemplates } from '@/components/workflows/WorkflowTemplates';

interface WorkflowTemplate {
  template_id: string;
  name: string;
  description: string;
  tags: string[];
  steps_count: number;
}

export default function WorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.converto.fi';
      const response = await fetch(`${apiUrl}/api/v1/agent-orchestrator/templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Visual Workflow Designer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Rakenna ja hallitse multi-agent workflowja visuaalisesti
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 dark:text-gray-400">Ladataan...</div>
          </div>
        ) : selectedTemplate ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <NodePalette />
            </div>
            <div className="col-span-9">
              <WorkflowCanvas templateId={selectedTemplate} />
            </div>
          </div>
        ) : (
          <WorkflowTemplates
            templates={templates}
            onSelectTemplate={(templateId) => setSelectedTemplate(templateId)}
          />
        )}
      </div>
    </div>
  );
}
