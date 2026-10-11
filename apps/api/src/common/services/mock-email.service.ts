import { Injectable } from '@nestjs/common';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class MockEmailService {
  private sentEmails: Array<{ options: EmailOptions; timestamp: Date }> = [];

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const messageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📧 [MOCK EMAIL] Sending email:');
    console.log(`   To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log(`   MessageId: ${messageId}`);
    if (options.text) console.log(`   Text: ${options.text.substring(0, 200)}...`);
    if (options.html) console.log(`   HTML: ${options.html.substring(0, 200)}...`);
    if (options.attachments?.length) {
      console.log(`   Attachments: ${options.attachments.length} file(s)`);
    }

    this.sentEmails.push({ options, timestamp: new Date() });

    return { success: true, messageId };
  }

  async sendTemplatedEmail(
    template: string,
    to: string | string[],
    data: Record<string, any>,
  ): Promise<EmailResult> {
    const subject = this.getSubjectForTemplate(template, data);
    const html = this.renderTemplate(template, data);
    return this.sendEmail({ to, subject, html });
  }

  private getSubjectForTemplate(template: string, data: Record<string, any>): string {
    const subjects: Record<string, string> = {
      'welcome': `Welcome to ${data.clinicName || 'Vemtap Health Clinic'}`,
      'password-reset': 'Password Reset Request',
      '2fa-code': 'Your Two-Factor Authentication Code',
      'appointment-confirmation': `Appointment Confirmed - ${data.appointmentDate}`,
      'appointment-reminder': `Appointment Reminder - ${data.appointmentDate}`,
      'payment-receipt': `Payment Receipt - ${data.amount}`,
      'invoice': `Invoice ${data.invoiceNumber} from ${data.clinicName}`,
      'claim-submitted': `HMO Claim Submitted - ${data.claimNumber}`,
      'claim-status': `HMO Claim Status Update - ${data.claimNumber}`,
      'otp-verification': 'Your Verification Code',
    };
    return subjects[template] || 'Vemtap Health Clinic Notification';
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Vemtap Health Clinic</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          {{CONTENT}}
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>This is an automated message from Vemtap Health Clinic Management System.</p>
          <p>&copy; ${new Date().getFullYear()} Vemtap Health Clinic. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const templates: Record<string, string> = {
      'welcome': `
        <h2 style="color: #1f2937;">Welcome to Vemtap Health Clinic!</h2>
        <p>Hello <strong>${data.firstName || 'there'}</strong>,</p>
        <p>Welcome to ${data.clinicName || 'Vemtap Health Clinic'}. Your account has been created successfully.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Email: ${data.email}</li>
          <li>Temporary Password: ${data.tempPassword || 'Set via login page'}</li>
        </ul>
        <p>Please log in and change your password immediately.</p>
        <a href="${data.loginUrl || 'https://clinic.vemtap.com/login'}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Login to Your Account</a>
      `,
      'password-reset': `
        <h2 style="color: #1f2937;">Password Reset Request</h2>
        <p>Hello <strong>${data.firstName || 'there'}</strong>,</p>
        <p>You requested a password reset for your account. Use the button below to create a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </p>
        <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      `,
      '2fa-code': `
        <h2 style="color: #1f2937;">Two-Factor Authentication Code</h2>
        <p>Hello <strong>${data.firstName || 'there'}</strong>,</p>
        <p>Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background: #f3f4f6; border: 2px dashed #059669; padding: 20px 40px; border-radius: 12px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #059669; font-family: monospace;">${data.code}</span>
        </div>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
      `,
      'appointment-confirmation': `
        <h2 style="color: #1f2937;">Appointment Confirmed</h2>
        <p>Hello <strong>${data.patientName || 'Patient'}</strong>,</p>
        <p>Your appointment has been confirmed.</p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Date:</strong> ${data.appointmentDate}</p>
          <p><strong>Time:</strong> ${data.appointmentTime}</p>
          <p><strong>Doctor:</strong> ${data.doctorName}</p>
          <p><strong>Type:</strong> ${data.appointmentType}</p>
          <p><strong>Location:</strong> ${data.clinicName}</p>
        </div>
        <p>Please arrive 15 minutes before your appointment.</p>
      `,
      'appointment-reminder': `
        <h2 style="color: #1f2937;">Appointment Reminder</h2>
        <p>Hello <strong>${data.patientName || 'Patient'}</strong>,</p>
        <p>This is a reminder for your upcoming appointment.</p>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Date:</strong> ${data.appointmentDate}</p>
          <p><strong>Time:</strong> ${data.appointmentTime}</p>
          <p><strong>Doctor:</strong> ${data.doctorName}</p>
        </div>
        <p>Please arrive 15 minutes early. Reply to this email if you need to reschedule.</p>
      `,
      'payment-receipt': `
        <h2 style="color: #1f2937;">Payment Receipt</h2>
        <p>Thank you for your payment!</p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Amount:</strong> ${data.amount}</p>
          <p><strong>Method:</strong> ${data.method}</p>
          <p><strong>Reference:</strong> ${data.reference}</p>
          <p><strong>Date:</strong> ${data.date}</p>
        </div>
      `,
      'invoice': `
        <h2 style="color: #1f2937;">New Invoice</h2>
        <p>Hello <strong>${data.patientName || 'Patient'}</strong>,</p>
        <p>You have a new invoice from ${data.clinicName}.</p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Invoice:</strong> ${data.invoiceNumber}</p>
          <p><strong>Amount:</strong> ${data.amount}</p>
          <p><strong>Due Date:</strong> ${data.dueDate}</p>
        </div>
        <p>Please make payment before the due date.</p>
      `,
      'claim-submitted': `
        <h2 style="color: #1f2937;">HMO Claim Submitted</h2>
        <p>Claim <strong>${data.claimNumber}</strong> has been submitted to ${data.hmoName}.</p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Patient:</strong> ${data.patientName}</p>
          <p><strong>Amount:</strong> ${data.amount}</p>
          <p><strong>Diagnosis:</strong> ${data.diagnosis}</p>
        </div>
      `,
      'claim-status': `
        <h2 style="color: #1f2937;">Claim Status Update</h2>
        <p>Your claim <strong>${data.claimNumber}</strong> status has been updated to <strong>${data.status}</strong>.</p>
        <p>Approved Amount: ${data.approvedAmount}</p>
      `,
      'otp-verification': `
        <h2 style="color: #1f2937;">Verification Code</h2>
        <p>Your OTP code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background: #f3f4f6; border: 2px dashed #059669; padding: 20px 40px; border-radius: 12px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #059669; font-family: monospace;">${data.code}</span>
        </div>
        <p>This code expires in 5 minutes.</p>
      `,
    };

    const content = templates[template] || `<p>${JSON.stringify(data)}</p>`;
    return baseTemplate.replace('{{CONTENT}}', content);
  }

  getSentEmails(): Array<{ options: EmailOptions; timestamp: Date }> {
    return this.sentEmails;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }
}