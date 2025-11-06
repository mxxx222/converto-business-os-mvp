/**
 * CRM Integration - Automated Lead Management
 */

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  source: string;
  stage: 'pilot' | 'demo' | 'qualified' | 'customer';
  createdAt: Date;
  document_types?: string[];
  metadata?: Record<string, any>;
}

class CRMIntegration {
  private leads: Lead[] = [];

  async createLead(data: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
    const lead: Lead = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...data,
    };

    // Store locally
    this.leads.push(lead);
    this.persistLeads();

    // Send to CRM API
    await this.sendToCRM(lead);

    // Trigger automation workflow
    await this.triggerAutomation(lead);

    return lead;
  }

  private async sendToCRM(lead: Lead) {
    try {
      await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    } catch (error) {
      console.error('Failed to send lead to CRM:', error);
    }
  }

  private async triggerAutomation(lead: Lead) {
    try {
      // Trigger welcome email sequence
      await fetch('/api/automation/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          email: lead.email,
          name: lead.name,
          company: lead.company,
        }),
      });

      // Schedule follow-up reminders
      await fetch('/api/automation/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          sequence: 'pilot-nurture',
          delays: [1, 3, 7], // Days
        }),
      });
    } catch (error) {
      console.error('Failed to trigger automation:', error);
    }
  }

  private persistLeads() {
    try {
      localStorage.setItem('converto_leads', JSON.stringify(this.leads));
    } catch (error) {
      console.warn('Failed to persist leads:', error);
    }
  }

  getLeads(): Lead[] {
    return this.leads;
  }

  getLeadsByStage(stage: Lead['stage']): Lead[] {
    return this.leads.filter(lead => lead.stage === stage);
  }

  updateLeadStage(leadId: string, stage: Lead['stage']) {
    const lead = this.leads.find(l => l.id === leadId);
    if (lead) {
      lead.stage = stage;
      this.persistLeads();
    }
  }

  getConversionMetrics() {
    const total = this.leads.length;
    const pilots = this.getLeadsByStage('pilot').length;
    const demos = this.getLeadsByStage('demo').length;
    const qualified = this.getLeadsByStage('qualified').length;
    const customers = this.getLeadsByStage('customer').length;

    return {
      total,
      pilots,
      demos,
      qualified,
      customers,
      pilotToDemo: pilots > 0 ? (demos / pilots * 100).toFixed(1) : '0',
      demoToQualified: demos > 0 ? (qualified / demos * 100).toFixed(1) : '0',
      qualifiedToCustomer: qualified > 0 ? (customers / qualified * 100).toFixed(1) : '0',
      overallConversion: total > 0 ? (customers / total * 100).toFixed(1) : '0',
    };
  }
}

export const crmIntegration = new CRMIntegration();