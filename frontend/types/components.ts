import { ReactNode } from 'react';

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

// Button variants and sizes
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Form validation
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User and company types
export interface User {
  id: string;
  email: string;
  name: string;
  company?: Company;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  employees?: string;
  monthlyInvoices?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'viewer' | 'beta';

// Document processing types
export interface Document {
  id: string;
  filename: string;
  type: DocumentType;
  status: DocumentStatus;
  ocrResult?: OCRResult;
  confidence: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 
  | 'purchase_invoice' 
  | 'receipt' 
  | 'freight_document' 
  | 'order_confirmation' 
  | 'contract';

export type DocumentStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'approved' 
  | 'rejected';

export interface OCRResult {
  supplier?: string;
  amount?: number;
  vatAmount?: number;
  invoiceNumber?: string;
  dueDate?: string;
  reference?: string;
  iban?: string;
  confidence: number;
  fields: OCRField[];
}

export interface OCRField {
  name: string;
  value: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Analytics and tracking
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

export interface ConversionMetrics {
  pageViews: number;
  signups: number;
  demos: number;
  trials: number;
  conversions: number;
  conversionRate: number;
}

// Feature flags
export interface FeatureFlags {
  betaSignup: boolean;
  newROICalculator: boolean;
  storyBrandHero: boolean;
  crispChat: boolean;
  urgencyBanner: boolean;
}

// SEO and metadata
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

// Error handling
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}
