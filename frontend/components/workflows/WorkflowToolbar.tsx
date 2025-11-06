'use client';

import { useState } from 'react';

interface WorkflowToolbarProps {
  workflowId?: string;
  onSave: (workflowData: any) => Promise<void>;
  onRun: () => Promise<void>;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  isRunning?: boolean;
}

export function WorkflowToolbar({
  workflowId,
  onSave,
  onRun,
  onExport,
  onImport,
  isRunning,
}: WorkflowToolbarProps) {
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get workflow data from parent component
      // For now, we'll use a placeholder
      const workflowData = {
        nodes: [],
        edges: [],
        metadata: {
          name: 'My Workflow',
          description: '',
        },
      };
      await onSave(workflowData);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      await onRun();
    } catch (error) {
      console.error('Failed to run workflow:', error);
    } finally {
      setRunning(false);
    }
  };

  const handleExport = () => {
    onExport();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onImport(file);
      } catch (error) {
        console.error('Failed to import workflow:', error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Tallennetaan...
            </>
          ) : (
            <>
              💾 Tallenna
            </>
          )}
        </button>

        <button
          onClick={handleRun}
          disabled={running || isRunning}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {running || isRunning ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Suoritetaan...
            </>
          ) : (
            <>
              ▶️ Suorita
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2">
          📥 Tuo
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          📤 Vie
        </button>
      </div>
    </div>
  );
}


