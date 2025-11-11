/**
 * DocFlow Resend Slack Alert Integration
 * Example Slack webhook implementations for bounce/complaint thresholds
 */

const fetch = require('node-fetch')

class SlackAlerts {
  constructor(webhookUrl = process.env.SLACK_WEBHOOK_URL) {
    this.webhookUrl = webhookUrl
    this.enabled = !!webhookUrl
  }

  /**
   * Send alert to Slack with formatting
   */
  async sendAlert(alert) {
    if (!this.enabled) {
      console.log('📢 Slack alerts disabled (no webhook URL configured)')
      return false
    }

    const payload = {
      text: alert.text,
      attachments: alert.attachments || [],
      blocks: alert.blocks || []
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        console.log('✅ Slack alert sent successfully')
        return true
      } else {
        console.error('❌ Slack alert failed:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ Slack alert error:', error)
      return false
    }
  }

  /**
   * Bounce Rate Alert (> 2%)
   */
  async sendBounceRateAlert(bounceRate, threshold, period = 'daily') {
    const emoji = bounceRate > (threshold * 1.5) ? '🚨' : '⚠️'
    
    const alert = {
      text: `${emoji} DocFlow Email Bounce Rate Alert`,
      attachments: [
        {
          color: bounceRate > (threshold * 1.5) ? 'danger' : 'warning',
          fields: [
            {
              title: 'Current Bounce Rate',
              value: `${(bounceRate * 100).toFixed(2)}%`,
              short: true
            },
            {
              title: 'Threshold',
              value: `${(threshold * 100).toFixed(1)}%`,
              short: true
            },
            {
              title: 'Period',
              value: period,
              short: true
            },
            {
              title: 'Status',
              value: bounceRate > threshold ? '🔴 EXCEEDED' : '🟡 NEAR LIMIT',
              short: true
            }
          ],
          actions: [
            {
              type: 'button',
              text: 'View Resend Dashboard',
              url: 'https://resend.com/domains'
            },
            {
              type: 'button',
              text: 'Check Email Lists',
              url: 'https://docflow.fi/admin/email-lists'
            }
          ]
        }
      ]
    }

    await this.sendAlert(alert)
  }

  /**
   * Complaint Rate Alert (> 0.1%) - CRITICAL
   */
  async sendComplaintRateAlert(complaintRate, threshold, period = 'daily') {
    const alert = {
      text: '🚨 CRITICAL: DocFlow Email Complaint Rate Alert',
      attachments: [
        {
          color: 'danger',
          title: '🚨 URGENT ACTION REQUIRED',
          fields: [
            {
              title: 'Current Complaint Rate',
              value: `${(complaintRate * 100).toFixed(3)}%`,
              short: true
            },
            {
              title: 'Threshold',
              value: `${(threshold * 100).toFixed(1)}%`,
              short: true
            },
            {
              title: 'Impact',
              value: '🟠 SPAM REPORTS DETECTED',
              short: true
            },
            {
              title: 'Priority',
              value: '🔴 HIGH',
              short: true
            }
          ],
          actions: [
            {
              type: 'button',
              text: '🚨 URGENT: View Resend Dashboard',
              url: 'https://resend.com/domains',
              style: 'primary'
            },
            {
              type: 'button',
              text: 'Check Suppression List',
              url: 'https://docflow.fi/admin/suppression'
            },
            {
              type: 'button',
              text: 'Review Recent Campaigns',
              url: 'https://docflow.fi/admin/campaigns'
            }
          ]
        }
      ]
    }

    await this.sendAlert(alert)
  }

  /**
   * Delivery Rate Warning (< 98%)
   */
  async sendDeliveryRateWarning(deliveryRate, target = 0.98, period = 'weekly') {
    const alert = {
      text: '🟡 DocFlow Email Delivery Rate Warning',
      attachments: [
        {
          color: 'warning',
          fields: [
            {
              title: 'Current Delivery Rate',
              value: `${(deliveryRate * 100).toFixed(1)}%`,
              short: true
            },
            {
              title: 'Target Rate',
              value: `${(target * 100).toFixed(0)}%`,
              short: true
            },
            {
              title: 'Period',
              value: period,
              short: true
            },
            {
              title: 'Action Required',
              value: '📋 Review list quality and templates',
              short: true
            }
          ],
          actions: [
            {
              type: 'button',
              text: 'View Email Analytics',
              url: 'https://docflow.fi/admin/analytics'
            },
            {
              type: 'button',
              text: 'Check DNS Records',
              url: 'https://resend.com/domains'
            }
          ]
        }
      ]
    }

    await this.sendAlert(alert)
  }

  /**
   * Weekly Summary Report
   */
  async sendWeeklyReport(metrics) {
    const {
      total_sent,
      delivery_rate,
      bounce_rate,
      complaint_rate,
      open_rate,
      click_rate
    } = metrics

    const alert = {
      text: '📊 DocFlow Resend Weekly Report',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 DocFlow Resend Weekly Report'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Emails Sent:*\n${total_sent}`
            },
            {
              type: 'mrkdwn',
              text: `*Delivery Rate:*\n${(delivery_rate * 100).toFixed(1)}%`
            },
            {
              type: 'mrkdwn',
              text: `*Bounce Rate:*\n${(bounce_rate * 100).toFixed(2)}%`
            },
            {
              type: 'mrkdwn',
              text: `*Complaint Rate:*\n${(complaint_rate * 100).toFixed(3)}%`
            },
            {
              type: 'mrkdwn',
              text: `*Open Rate:*\n${(open_rate * 100).toFixed(1)}%`
            },
            {
              type: 'mrkdwn',
              text: `*Click Rate:*\n${(click_rate * 100).toFixed(1)}%`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: '📈 View Detailed Analytics',
              url: 'https://docflow.fi/admin/analytics',
              style: 'primary'
            },
            {
              type: 'button',
              text: '🔧 Manage Email Lists',
              url: 'https://docflow.fi/admin/email-lists'
            }
          ]
        }
      ]
    }

    await this.sendAlert(alert)
  }

  /**
   * Incident Alert (for bounce/complaint spikes)
   */
  async sendIncidentAlert(incident) {
    const { type, description, metrics, period } = incident

    const alert = {
      text: `🚨 DocFlow Email Incident: ${type}`,
      attachments: [
        {
          color: 'danger',
          title: 'Email System Incident Detected',
          text: description,
          fields: [
            {
              title: 'Incident Type',
              value: type,
              short: true
            },
            {
              title: 'Period',
              value: period,
              short: true
            }
          ],
          actions: [
            {
              type: 'button',
              text: '🚨 Immediate Action',
              url: 'https://resend.com/domains',
              style: 'primary'
            },
            {
              type: 'button',
              text: 'View Incident History',
              url: 'https://docflow.fi/admin/incidents'
            }
          ]
        }
      ]
    }

    await this.sendAlert(alert)
  }
}

// Example usage functions
async function testBounceAlert() {
  const slack = new SlackAlerts()
  
  console.log('🧪 Testing bounce rate alert...')
  await slack.sendBounceRateAlert(0.025, 0.02, 'daily')
  
  console.log('🧪 Testing critical complaint alert...')
  await slack.sendComplaintRateAlert(0.0015, 0.001, 'daily')
  
  console.log('🧪 Testing delivery rate warning...')
  await slack.sendDeliveryRateWarning(0.96, 0.98, 'weekly')
  
  console.log('🧪 Testing weekly report...')
  await slack.sendWeeklyReport({
    total_sent: 1247,
    delivery_rate: 0.978,
    bounce_rate: 0.012,
    complaint_rate: 0.0005,
    open_rate: 0.241,
    click_rate: 0.062
  })
}

// Monitoring integration example
class EmailMonitoring {
  constructor() {
    this.slack = new SlackAlerts()
    this.thresholds = {
      bounce_rate: 0.02,      // 2%
      complaint_rate: 0.001,   // 0.1%
      delivery_rate: 0.98      // 98%
    }
  }

  async checkThresholds(metrics) {
    // Check bounce rate
    if (metrics.bounce_rate > this.thresholds.bounce_rate) {
      await this.slack.sendBounceRateAlert(
        metrics.bounce_rate, 
        this.thresholds.bounce_rate
      )
    }

    // Check complaint rate (CRITICAL)
    if (metrics.complaint_rate > this.thresholds.complaint_rate) {
      await this.slack.sendComplaintRateAlert(
        metrics.complaint_rate, 
        this.thresholds.complaint_rate
      )
    }

    // Check delivery rate
    if (metrics.delivery_rate < this.thresholds.delivery_rate) {
      await this.slack.sendDeliveryRateWarning(
        metrics.delivery_rate, 
        this.thresholds.delivery_rate
      )
    }
  }
}

module.exports = { SlackAlerts, EmailMonitoring, testBounceAlert }