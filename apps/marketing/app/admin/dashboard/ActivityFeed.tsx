'use client';

// Check if styles.module.css exists, if not use empty object
let styles: Record<string, string> = {};
try {
  styles = require('./styles.module.css');
} catch {
  // Styles file not found, use empty object
}

export default function ActivityFeed() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
      <p className="text-gray-600">Real-time activity feed</p>
    </div>
  );
}
