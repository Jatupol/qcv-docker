// server/src/utils/emailService.ts
/**
 * Shared Email Service Utility
 * Provides reusable email sending functionality for the entire application
 * Supports defect notifications, system alerts, and custom email templates
 */
 
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

// ==================== INTERFACES ====================

export interface EmailConfig {
  smtp_server: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
    cid?: string;
  }>;
}

export interface DefectEmailData {
  inspection_no: string;
  station: string;
  defect_date: Date;
  inspector: string;
  qc_name: string;
  qclead_name: string;
  defect_id: number;
  defect_name?: string;
  ng_qty: number;
  trayno?: string;
  tray_position?: string;
  color?: string;
  defect_detail?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ==================== EMAIL SERVICE CLASS ====================

/**
 * Email Service for sending notifications
 */
export class EmailService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Get active email configuration from database
   */
  private async getEmailConfig(): Promise<EmailConfig | null> {
    try {
      const result = await this.db.query(`
        SELECT smtp_server, smtp_port, smtp_username, smtp_password
        FROM sysconfig
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        console.warn('⚠️ No active email configuration found');
        return null;
      }

      const config = result.rows[0];

      if (!config.smtp_server || !config.smtp_username || !config.smtp_password) {
        console.warn('⚠️ Email configuration is incomplete');
        return null;
      }

      return {
        smtp_server: config.smtp_server,
        smtp_port: config.smtp_port || 587,
        smtp_username: config.smtp_username,
        smtp_password: config.smtp_password,
      };
    } catch (error) {
      console.error('❌ Error fetching email configuration:', error);
      return null;
    }
  }

  /**
   * Create nodemailer transporter with current configuration
   */
  private async createTransporter(): Promise<nodemailer.Transporter | null> {
    const config = await this.getEmailConfig();

    if (!config) {
      return null;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.smtp_server,
        port: config.smtp_port,
        secure: config.smtp_port === 465, // true for 465, false for other ports
        auth: {
          user: config.smtp_username,
          pass: config.smtp_password,
        },
        tls: {
          rejectUnauthorized: false, // Accept self-signed certificates
        },
      });

      // Verify connection
      await transporter.verify();
      console.log('✅ Email transporter created and verified');

      return transporter;
    } catch (error) {
      console.error('❌ Error creating email transporter:', error);
      return null;
    }
  }

  /**
   * Send email with the provided options
   */
  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    try {
      const transporter = await this.createTransporter();

      if (!transporter) {
        return {
          success: false,
          error: 'Email service is not configured or unavailable',
        };
      }

      const config = await this.getEmailConfig();
      const fromAddress = options.from || `"QCV System" <${config?.smtp_username}>`;

      console.log(`📤 Sending email to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      if (options.attachments && options.attachments.length > 0) {
        console.log(`📎 Including ${options.attachments.length} attachment(s)`);
      }

      const info = await transporter.sendMail({
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      });

      console.log('✅ Email sent successfully:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email',
      };
    }
  }

 
  /**
   * Get defect notification email addresses
   */
  async getDefectNotificationEmails(): Promise<string[]> {
    try {
      const result = await this.db.query(`
        SELECT defect_notification_emails
        FROM sysconfig
        ORDER BY created_at DESC
        LIMIT 1
      `);

      if (result.rows.length === 0 || !result.rows[0].defect_notification_emails) {
        return [];
      }

      const emails = result.rows[0].defect_notification_emails
        .split(',')
        .map((email: string) => email.trim())
        .filter((email: string) => email.length > 0);

      return emails;
    } catch (error) {
      console.error('❌ Error fetching defect notification emails:', error);
      return [];
    }
  }

  /**
   * Send defect notification email
   */
  async sendDefectNotification(defectData: DefectEmailData): Promise<EmailSendResult> {
    try {
   

      // Get recipient emails
      const recipients = await this.getDefectNotificationEmails();
      if (recipients.length === 0) {
        console.log('ℹ️ No defect notification email addresses configured');
        return {
          success: true, // Not an error, just no recipients
          error: 'No defect notification email addresses configured',
        };
      }

      // Format defect data for email
      const formattedDate = new Date(defectData.defect_date).toLocaleString();
      const defectName = defectData.defect_name || `Defect #${defectData.defect_id}`;

      // Create HTML email content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .section { background: white; padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 4px solid #f97316; }
            .label { font-weight: bold; color: #6b7280; display: inline-block; width: 180px; }
            .value { color: #111827; }
            .highlight { background: #fef3c7; padding: 2px 8px; border-radius: 4px; font-weight: bold; color: #92400e; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🚨 Defect Notification</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Quality Control & Verification System</p>
            </div>

            <div class="content">
              <div class="section">
                <h3 style="margin-top: 0; color: #f97316;">📋 Inspection Information</h3>
                <p><span class="label">Sampling No:</span> <span class="value">${defectData.inspection_no}</span></p>
                <p><span class="label">Station:</span> <span class="value">${defectData.station}</span></p>
                <p><span class="label">Date:</span> <span class="value">${formattedDate}</span></p>
                <p><span class="label">Inspector:</span> <span class="value">${defectData.inspector}</span></p>
              </div>

              <div class="section">
                <h3 style="margin-top: 0; color: #dc2626;">⚠️ Defect Details</h3>
                <p><span class="label">Defect Type:</span> <span class="value">${defectName}</span></p>
                <p><span class="label">NG Quantity:</span> <span class="highlight">${defectData.ng_qty}</span></p>
                ${defectData.trayno ? `<p><span class="label">Tray No:</span> <span class="value">${defectData.trayno}</span></p>` : ''}
                ${defectData.tray_position ? `<p><span class="label">Tray Position:</span> <span class="value">${defectData.tray_position}</span></p>` : ''}
                ${defectData.color ? `<p><span class="label">Color Group:</span> <span class="value">${defectData.color}</span></p>` : ''}
                ${defectData.defect_detail ? `<p><span class="label">Detail:</span> <span class="value"><em>${defectData.defect_detail}</em></span></p>` : ''}
              </div>

              <div class="section">
                <h3 style="margin-top: 0; color: #2563eb;">👥 Quality Control Team</h3>
                <p><span class="label">QC Name:</span> <span class="value">${defectData.qc_name}</span></p>
                <p><span class="label">QC Leader:</span> <span class="value">${defectData.qclead_name}</span></p>
              </div>

              <div class="footer">
                <p>This is an automated notification from the QCV System.</p>
                <p style="font-size: 12px; color: #9ca3af;">Generated at ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create plain text version
      const textContent = `
DEFECT NOTIFICATION - QCV System
================================

INSPECTION INFORMATION
- Sampling No: ${defectData.inspection_no}
- Station: ${defectData.station}
- Date: ${formattedDate}
- Inspector: ${defectData.inspector}

DEFECT DETAILS
- Defect Type: ${defectName}
- NG Quantity: ${defectData.ng_qty}
${defectData.trayno ? `- Tray No: ${defectData.trayno}` : ''}
${defectData.tray_position ? `- Tray Position: ${defectData.tray_position}` : ''}
${defectData.color ? `- Color Group: ${defectData.color}` : ''}
${defectData.defect_detail ? `- Detail: ${defectData.defect_detail}` : ''}

QUALITY CONTROL TEAM
- QC Name: ${defectData.qc_name}
- QC Leader: ${defectData.qclead_name}

---
This is an automated notification from the QCV System.
Generated at ${new Date().toLocaleString()}
      `.trim();

      // Send the email
      const result = await this.sendEmail({
        to: recipients,
        subject: `🚨 Defect Detected - ${defectData.inspection_no} (${defectData.station})`,
        text: textContent,
        html: htmlContent,
      });

      if (result.success) {
        console.log(`✅ Defect notification sent to ${recipients.length} recipient(s)`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error sending defect notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Create email service instance
 */
export function createEmailService(db: Pool): EmailService {
  return new EmailService(db);
}

// ==================== DEFAULT EXPORT ====================

export default EmailService;
