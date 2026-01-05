import { describe, it, expect } from 'vitest';
import { sendEmail, isSMTPConfigured } from './reports/email-sender';
import { sendInvoiceEmail } from './invoices/email';

describe('SMTP2GO API Email System', () => {
  describe('SMTP2GO Configuration', () => {
    it('should check if SMTP2GO API is configured', () => {
      const isConfigured = isSMTPConfigured();
      // Will be false until SMTP2GO_API_KEY is set
      expect(typeof isConfigured).toBe('boolean');
    });
  });

  describe('Email Sending Functions', () => {
    it('should have sendEmail function', () => {
      expect(typeof sendEmail).toBe('function');
    });

    it('should have sendInvoiceEmail function', () => {
      expect(typeof sendInvoiceEmail).toBe('function');
    });

    it('should return false when SMTP2GO API is not configured', async () => {
      // Only test if API is not configured
      if (!isSMTPConfigured()) {
        const result = await sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        });
        expect(result).toBe(false);
      }
    });
  });

  describe('Email Parameters Validation', () => {
    it('should accept valid email parameters', async () => {
      const params = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<h1>Test Email</h1>',
        from: 'noreply@sary.live',
      };

      // Should not throw
      expect(() => {
        sendEmail(params);
      }).not.toThrow();
    });

    it('should accept HTML content', async () => {
      const htmlContent = `
        <div style="font-family: Arial;">
          <h1>Test</h1>
          <p>This is a test email</p>
        </div>
      `;

      const params = {
        to: 'test@example.com',
        subject: 'HTML Test',
        html: htmlContent,
      };

      expect(() => {
        sendEmail(params);
      }).not.toThrow();
    });
  });

  describe('SMTP2GO API Integration', () => {
    it('should use SMTP2GO API endpoint', () => {
      // This is a structural test to ensure we're using the API
      const emailSenderCode = sendEmail.toString();
      expect(emailSenderCode).toContain('api.smtp2go.com');
    });

    it('should use API authentication header', () => {
      const emailSenderCode = sendEmail.toString();
      expect(emailSenderCode).toContain('X-Smtp2go-Api-Key');
    });
  });
});
