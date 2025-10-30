/** Email API client for Converto Business OS */

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from_email?: string;
  reply_to?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface PilotSignupRequest {
  email: string;
  name: string;
  company: string;
}

export interface DeploymentNotificationRequest {
  service_name: string;
  status: string;
  url?: string;
}

export interface DailyReportRequest {
  metrics: Record<string, any>;
}

export interface ErrorAlertRequest {
  error_message: string;
  service: string;
  severity?: string;
}

export class EmailAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1/email') {
    this.baseUrl = baseUrl;
  }

  async sendEmail(request: EmailRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.status}`);
    }

    return response.json();
  }

  async pilotSignup(request: PilotSignupRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pilot-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Pilot signup API error: ${response.status}`);
    }

    return response.json();
  }

  async deploymentNotification(request: DeploymentNotificationRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/deployment-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Deployment notification API error: ${response.status}`);
    }

    return response.json();
  }

  async dailyReport(request: DailyReportRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/daily-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Daily report API error: ${response.status}`);
    }

    return response.json();
  }

  async errorAlert(request: ErrorAlertRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/error-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Error alert API error: ${response.status}`);
    }

    return response.json();
  }

  async getTemplates(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/templates`);

    if (!response.ok) {
      throw new Error(`Templates API error: ${response.status}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Health check API error: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const emailAPI = new EmailAPI();
