/**
 * Helper functions for Activity Feed component
 */

import type { Activity, ActivityType, ActivityStatus } from './types';

/**
 * Format timestamp to Finnish locale
 */
export function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Juuri nyt';
    } else if (diffMins < 60) {
      return `${diffMins} min sitten`;
    } else if (diffHours < 24) {
      return `${diffHours} t sitten`;
    } else if (diffDays < 7) {
      return `${diffDays} pv sitten`;
    } else {
      return date.toLocaleDateString('fi-FI', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch {
    return timestamp;
  }
}

/**
 * Get icon emoji for activity type
 */
export function getActivityIcon(type: ActivityType): string {
  const iconMap: Record<ActivityType, string> = {
    upload: '📤',
    queued: '⏳',
    processing: '⚙️',
    completed: '✅',
    failed: '❌',
    export_scheduled: '📥',
    user_action: '👤',
    system_event: '🔧',
    error: '🚨',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return iconMap[type] || '📋';
}

/**
 * Get title for activity
 */
export function getActivityTitle(activity: Activity): string {
  if (activity.title) {
    return activity.title;
  }

  const titleMap: Record<ActivityType, string> = {
    upload: 'Tiedosto ladattu',
    queued: 'Jonossa',
    processing: 'Käsitellään',
    completed: 'Valmis',
    failed: 'Epäonnistui',
    export_scheduled: 'Vienti ajastettu',
    user_action: 'Käyttäjän toiminto',
    system_event: 'Järjestelmätapahtuma',
    error: 'Virhe',
    warning: 'Varoitus',
    info: 'Tiedote'
  };

  return titleMap[activity.type] || 'Aktiviteetti';
}

/**
 * Get details text for activity
 */
export function getActivityDetails(activity: Activity): string {
  if (activity.details) {
    return activity.details;
  }

  // Generate details from metadata
  if (activity.metadata) {
    const parts: string[] = [];
    
    if (activity.metadata.filename) {
      parts.push(`Tiedosto: ${activity.metadata.filename}`);
    }
    if (activity.metadata.status) {
      parts.push(`Tila: ${activity.metadata.status}`);
    }
    if (activity.metadata.error) {
      parts.push(`Virhe: ${activity.metadata.error}`);
    }
    if (activity.metadata.kind) {
      parts.push(`Tyyppi: ${activity.metadata.kind}`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Ei lisätietoja';
  }

  return 'Ei lisätietoja';
}

/**
 * Get status badge configuration
 */
export function getStatusBadge(status: ActivityStatus): { text: string; className: string } {
  const badgeMap: Record<ActivityStatus, { text: string; className: string }> = {
    success: { text: 'Onnistui', className: 'statusSuccess' },
    pending: { text: 'Odottaa', className: 'statusPending' },
    failed: { text: 'Epäonnistui', className: 'statusFailed' },
    warning: { text: 'Varoitus', className: 'statusWarning' },
    info: { text: 'Tiedote', className: 'statusInfo' }
  };

  return badgeMap[status] || { text: status, className: 'statusInfo' };
}

/**
 * Get CSS class name for activity type
 */
export function getActivityTypeClass(type: ActivityType): string {
  const classMap: Record<ActivityType, string> = {
    upload: 'typeUpload',
    queued: 'typeQueued',
    processing: 'typeProcessing',
    completed: 'typeCompleted',
    failed: 'typeFailed',
    export_scheduled: 'typeExport',
    user_action: 'typeUser',
    system_event: 'typeSystem',
    error: 'typeError',
    warning: 'typeWarning',
    info: 'typeInfo'
  };

  return classMap[type] || 'typeDefault';
}

