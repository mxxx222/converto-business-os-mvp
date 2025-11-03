export const TRACKING_EVENTS = {
  // Page events
  PAGE_VIEW: 'page_view',
  PAGE_EXIT_INTENT: 'exit_intent',
  PAGE_SCROLL_DEPTH: 'scroll_depth',

  // Section events
  SECTION_VIEW: 'section_view',
  SECTION_INTERSECTION: 'section_intersection',

  // CTA events
  CTA_CLICKED: 'cta_clicked',
  CTA_HOVER: 'cta_hover',
  CTA_FOCUS: 'cta_focus',
  FINAL_CTA_PRIMARY: 'final_cta_primary_click',
  FINAL_CTA_SECONDARY: 'final_cta_secondary_click',

  // Form events
  FORM_OPENED: 'form_opened',
  FORM_SUBMITTED: 'form_submitted',
  FORM_ERROR: 'form_error',
  DEMO_FORM_OPENED: 'demo_form_opened',
  DEMO_FORM_SUBMITTED: 'demo_form_submitted',

  // Conversion events
  PILOT_SIGNUP: 'pilot_signup',
  DEMO_REQUEST: 'demo_request',
  PDF_DOWNLOAD: 'pdf_download',
} as const;

export type TrackingEvent = typeof TRACKING_EVENTS[keyof typeof TRACKING_EVENTS];
