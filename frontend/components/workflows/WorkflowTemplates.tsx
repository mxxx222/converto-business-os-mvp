'use client';

import { useState } from 'react';

interface WorkflowTemplate {
  template_id: string;
  name: string;
  description: string;
  tags: string[];
  steps_count: number;
}

interface WorkflowTemplatesProps {
  templates: WorkflowTemplate[];
  onSelectTemplate: (templateId: string) => void;
}

export function WorkflowTemplates({ templates, onSelectTemplate }: WorkflowTemplatesProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Workflow-templatet
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.template_id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectTemplate(template.template_id)}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {template.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {template.steps_count} vaihetta
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


