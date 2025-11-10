/**
 * Helper functions for Activity Feed
 */

import type { Activity, ActivityType, ActivityStatus } from './types';

/**
 * Convert ISO timestamp to readable format (e.g., "2 min ago")
 */
export function formatTime(timestamp: string): string {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return `${diffSeconds} s sitten`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min sitten`;
  } else if (diffHours < 24) {
    return `${diffHours} h sitten`;
  } else if (diffDays === 1) {
    return 'Eilen';
  } else if (diffDays < 7) {
    return `${diffDays} päivää sitten`;
  } else {
    // Return formatted date for older activities
    return activityTime.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'short',
      year: activityTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

/**
 * Map activity type to emoji icon
 */
export function getActivityIcon(type: ActivityType): string {
  const iconMap: Record<ActivityType, string> = {
    upload: '📤',
    ocr_completed: '✅',
    ocr_failed: '❌',
    error: '❌',
    analysis_started: '🔄',
    export_generated: '📊'
  };
  return iconMap[type] || '📄';
}

/**
 * Generate readable title based on activity type and action
 */
export function getActivityTitle(activity: Activity): string {
  const { type, action, details } = activity;
  
  switch (type) {
    case 'upload':
      return details.filename
        ? `Dokumentti ladattu: ${String(details.filename)}`
        : 'Dokumentti ladattu';
    
    case 'ocr_completed':
      return 'OCR-käsittely valmis';
    
    case 'ocr_failed':
      return 'OCR-käsittely epäonnistui';
    
    case 'error':
      return details.error_type
        ? `Virhe: ${String(details.error_type)}`
        : 'Järjestelmävirhe';
    
    case 'analysis_started':
      return 'Analyysi aloitettu';
    
    case 'export_generated':
      return details.export_type
        ? `Vienti valmis: ${String(details.export_type).toUpperCase()}`
        : 'Vienti valmis';
    
    default:
      return action || 'Toiminto suoritettu';
  }
}

/**
 * Format activity details into readable text
 */
export function getActivityDetails(activity: Activity): string {
  const { details, user_email, type } = activity;
  
  const parts: string[] = [];
  
  // Add user information
  if (user_email) {
    parts.push(`Käyttäjä: ${user_email}`);
  }
  
  // Add type-specific details
  switch (type) {
    case 'upload':
      if (details.file_size) {
        const sizeMB = (Number(details.file_size) / (1024 * 1024)).toFixed(2);
        parts.push(`Koko: ${sizeMB} MB`);
      }
      if (details.file_type) {
        parts.push(`Tyyppi: ${String(details.file_type)}`);
      }
      break;
    
    case 'ocr_completed':
      if (details.pages_processed) {
        parts.push(`Sivut: ${String(details.pages_processed)}`);
      }
      if (details.processing_time) {
        parts.push(`Aika: ${String(details.processing_time)}s`);
      }
      if (details.confidence) {
        parts.push(`Luottamus: ${(Number(details.confidence) * 100).toFixed(0)}%`);
      }
      break;
    
    case 'ocr_failed':
    case 'error':
      if (details.error_message) {
        parts.push(`Virhe: ${String(details.error_message)}`);
      }
      if (details.retry_count) {
        parts.push(`Yritykset: ${String(details.retry_count)}`);
      }
      break;
    
    case 'analysis_started':
      if (details.analysis_type) {
        parts.push(`Tyyppi: ${String(details.analysis_type)}`);
      }
      break;
    
    case 'export_generated':
      if (details.records_count) {
        parts.push(`Rivit: ${String(details.records_count)}`);
      }
      if (details.file_size) {
        const sizeKB = (Number(details.file_size) / 1024).toFixed(2);
        parts.push(`Koko: ${sizeKB} KB`);
      }
      break;
  }
  
  return parts.join(' • ') || 'Ei lisätietoja';
}

/**
 * Get status badge configuration
 */
export function getStatusBadge(status: ActivityStatus): {
  text: string;
  className: string;
} {
  const badgeMap: Record<ActivityStatus, { text: string; className: string }> = {
    success: {
      text: 'Onnistui',
      className: 'badge-success'
    },
    error: {
      text: 'Virhe',
      className: 'badge-error'
    },
    failed: {
      text: 'Epäonnistui',
      className: 'badge-error'
    },
    pending: {
      text: 'Odottaa',
      className: 'badge-pending'
    },
    processing: {
      text: 'Käsitellään',
      className: 'badge-pending'
    },
    warning: {
      text: 'Varoitus',
      className: 'badge-warning'
    }
  };
  
  return badgeMap[status] || { text: status, className: 'badge-default' };
}

/**
 * Get activity type badge color class
 */
export function getActivityTypeClass(type: ActivityType): string {
  const classMap: Record<ActivityType, string> = {
    upload: 'activity-upload',
    ocr_completed: 'activity-success',
    ocr_failed: 'activity-error',
    error: 'activity-error',
    analysis_started: 'activity-processing',
    export_generated: 'activity-export'
  };
  return classMap[type] || 'activity-default';
}