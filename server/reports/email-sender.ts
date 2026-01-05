/**
 * نظام إرسال البريد الإلكتروني
 * يستخدم SMTP2GO API
 */

import { ENV } from '../_core/env';

/**
 * إرسال بريد إلكتروني عبر SMTP2GO API
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<boolean> {
  try {
    // التحقق من وجود API Key
    if (!ENV.smtp2goApiKey) {
      console.error('[Email] SMTP2GO API Key not configured');
      return false;
    }

    // إعداد البيانات
    const payload = {
      sender: options.from || ENV.smtpFrom,
      to: [options.to],
      subject: options.subject,
      html_body: options.html,
    };

    // إرسال الطلب إلى SMTP2GO API
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': ENV.smtp2goApiKey,
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.data?.succeeded > 0) {
      console.log('[Email] Sent successfully:', result.data.email_id);
      return true;
    } else {
      console.error('[Email] Failed to send:', result.data?.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * التحقق من تكوين SMTP2GO API
 */
export function isSMTPConfigured(): boolean {
  return !!ENV.smtp2goApiKey;
}
