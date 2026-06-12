import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { getSettings } from '@/lib/services/settings';
import React from 'react';

interface SendEmailParams {
  to: string;
  subject: string;
  template?: React.ReactElement;
  html?: string;
}

export async function sendEmail({
  to,
  subject,
  template,
  html,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getSettings();

    if (!settings.smtp_email || !settings.smtp_app_password) {
      console.error('[Email] SMTP is not configured in settings.');
      return { success: false, error: 'SMTP not configured' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.smtp_email,
        pass: settings.smtp_app_password.replace(/\s+/g, ''), // strip any spaces in app password
      },
    });

    // Render React Email template to plain HTML string if available
    let htmlContent = html;
    if (template) {
      htmlContent = await render(template);
    }

    if (!htmlContent) {
      console.error('[Email] No email content provided.');
      return { success: false, error: 'No email content' };
    }

    const info = await transporter.sendMail({
      from: `"${settings.smtp_from_name || settings.storeName}" <${settings.smtp_email}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`[Email] Message sent successfully: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error('[Email] Failed to send email via SMTP transporter:', error);
    return { success: false, error: error.message || 'SMTP delivery failed' };
  }
}
