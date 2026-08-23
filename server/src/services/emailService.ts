import nodemailer, { Transporter } from 'nodemailer';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';
import { IOrder } from '../models/Order';

export class EmailService {
  private transporter: Transporter | null = null;
  private isInitialized = false;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    try {
      // 1. If real Gmail / SMTP credentials are provided in .env
      if (ENV.SMTP_USER && ENV.SMTP_PASS) {
        if (ENV.SMTP_SERVICE === 'gmail' || ENV.SMTP_HOST.includes('gmail')) {
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: ENV.SMTP_USER,
              pass: ENV.SMTP_PASS, // 16-character App Password
            },
          });
        } else {
          this.transporter = nodemailer.createTransport({
            host: ENV.SMTP_HOST,
            port: ENV.SMTP_PORT,
            secure: ENV.SMTP_SECURE,
            auth: {
              user: ENV.SMTP_USER,
              pass: ENV.SMTP_PASS,
            },
          });
        }
        logger.info(`SMTP Transporter initialized for ${ENV.SMTP_USER} via ${ENV.SMTP_SERVICE || ENV.SMTP_HOST}`);
      } else {
        // 2. Automated Ethereal Test SMTP for frictionless testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info(`Initialized Ethereal Test SMTP (${testAccount.user}). Emails will produce live preview URLs.`);
      }
      this.isInitialized = true;
    } catch (err: any) {
      logger.error(`Failed to initialize SMTP transporter: ${err.message}`);
    }
  }

  /**
   * Send 60-Second Amazon OTP Verification Email
   */
  async sendOTPEmail(email: string, name: string, otp: string, type: 'signup' | 'login' | 'reset_password' = 'signup') {
    if (!this.transporter) await this.initTransporter();

    const subject =
      type === 'signup'
        ? `${otp} is your Amazon Enterprise account verification code`
        : type === 'login'
        ? `${otp} is your Amazon Enterprise sign-in OTP`
        : `${otp} is your password reset code`;

    const title =
      type === 'signup'
        ? 'Verify your new Amazon account'
        : type === 'login'
        ? 'Sign in with One-Time Password'
        : 'Password Reset Request';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f6f6; margin: 0; padding: 20px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
          .header { background: #131921; padding: 20px; text-align: center; }
          .logo { font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -1px; }
          .logo-orange { color: #f08804; }
          .content { padding: 30px 24px; color: #333333; line-height: 1.6; }
          .greeting { font-size: 16px; font-weight: bold; margin-bottom: 12px; }
          .otp-box { background: #fdf8e2; border: 2px dashed #f08804; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #111111; font-family: monospace; }
          .timer-badge { display: inline-block; background: #cc0c39; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; margin-top: 8px; }
          .notice { font-size: 12px; color: #666666; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 14px; }
          .footer { background: #eaeded; padding: 16px; text-align: center; font-size: 11px; color: #777777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">amazon<span class="logo-orange">.in</span></span>
          </div>
          <div class="content">
            <div class="greeting">Hello ${name || 'Customer'},</div>
            <p>Please use the following One-Time Password (OTP) to ${type === 'signup' ? 'complete your registration' : 'authenticate your account'}:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="timer-badge">⏳ Valid for 60 SECONDS only</div>
            </div>

            <p style="font-size: 13px; color: #444444;">
              <strong>Security Notice:</strong> Amazon will never call or email asking for this code. Do not share this OTP with anyone.
            </p>

            <div class="notice">
              <p>If you did not initiate this request, please disregard this email or contact our DPDP Grievance Officer.</p>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 Amazon Enterprise Platform. DPDP Act 2023 Compliant.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter!.sendMail({
        from: ENV.SMTP_FROM,
        to: email,
        subject,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`[SMTP EMAIL SENT] Real Preview URL: ${previewUrl}`);
      } else {
        logger.info(`[SMTP EMAIL SENT] Successfully delivered to ${email}`);
      }

      return { success: true, messageId: info.messageId, previewUrl: previewUrl || undefined };
    } catch (err: any) {
      logger.error(`Error sending OTP email to ${email}: ${err.message}`);
      throw new Error(`Failed to dispatch verification email: ${err.message}`);
    }
  }

  /**
   * Send Amazon Order Confirmation & Tax Invoice Email
   */
  async sendOrderConfirmationEmail(email: string, name: string, order: IOrder) {
    if (!this.transporter) await this.initTransporter();

    const itemsHtml = order.orderItems
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 10px 0;">
            <img src="${item.thumbnail}" alt="${item.title}" width="50" height="50" style="object-fit: contain; vertical-align: middle; margin-right: 10px;" />
            <strong>${item.title}</strong> ${item.variantName ? `<span style="font-size: 11px; color: #666;">(${item.variantName})</span>` : ''}
          </td>
          <td style="text-align: center; padding: 10px;">${item.quantity}</td>
          <td style="text-align: right; padding: 10px; font-weight: bold;">₹${item.price.toLocaleString('en-IN')}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f6f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
          .header { background: #131921; padding: 20px; text-align: center; }
          .logo { font-size: 26px; font-weight: 900; color: #ffffff; }
          .logo-orange { color: #f08804; }
          .content { padding: 24px; color: #333333; }
          .success-banner { background: #e7f4e8; border: 1px solid #b7e1cd; padding: 14px; border-radius: 6px; color: #0f5132; font-weight: bold; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th { text-align: left; background: #f8f9fa; padding: 8px; border-bottom: 2px solid #dee2e6; }
          .footer { background: #eaeded; padding: 16px; text-align: center; font-size: 11px; color: #777777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">amazon<span class="logo-orange">.in</span></span>
          </div>
          <div class="content">
            <div class="success-banner">
              ✓ Thank you for your order! Order #${order.orderNumber}
            </div>

            <p>Hello <strong>${name}</strong>,</p>
            <p>We've received your order and we're getting it ready to be dispatched. You can track your package anytime using the tracking ID below.</p>

            <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 12px; margin: 14px 0;">
              <div><strong>Tracking Number:</strong> ${order.trackingNumber}</div>
              <div><strong>Delivery Speed:</strong> ${order.deliveryMethod === 'prime_express' ? 'Prime 1-Day Express (FREE)' : 'Standard'}</div>
              <div><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            </div>

            <h3>Order Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: right; font-size: 14px; margin-top: 10px;">
              <div>Subtotal: <strong>₹${order.itemsPrice.toLocaleString('en-IN')}</strong></div>
              <div>Delivery: <strong>${order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</strong></div>
              <div>GST (18%): <strong>₹${order.taxPrice.toLocaleString('en-IN')}</strong></div>
              <div style="font-size: 18px; color: #cc0c39; margin-top: 6px;">Total Paid: <strong>₹${order.totalPrice.toLocaleString('en-IN')}</strong></div>
            </div>

            <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #eeeeee; font-size: 12px; color: #555;">
              <strong>Delivery Address:</strong><br />
              ${order.shippingAddress.fullName}<br />
              ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br />
              Phone: ${order.shippingAddress.phone}
            </div>
          </div>
          <div class="footer">
            &copy; 2026 Amazon Enterprise Platform. DPDP Act 2023 Compliant.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter!.sendMail({
        from: ENV.SMTP_FROM,
        to: email,
        subject: `Order Confirmation - #${order.orderNumber} - Amazon.in`,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`[ORDER EMAIL SENT] Preview URL: ${previewUrl}`);
      }
      return { success: true, previewUrl: previewUrl || undefined };
    } catch (err: any) {
      logger.error(`Error sending order email to ${email}: ${err.message}`);
    }
  }

  /**
   * Send Security & Account Change Alert Email
   */
  async sendSecurityAlertEmail(email: string, name: string, changeTitle: string, changeDetails: string) {
    if (!this.transporter) await this.initTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f6f6f6; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h3 style="color: #131921; margin-top: 0;">Amazon Security Alert</h3>
          <p>Hello ${name},</p>
          <p>This is to notify you that an update was made to your Amazon Enterprise account:</p>
          <div style="background: #f0f2f2; padding: 12px; border-radius: 6px; font-size: 13px; font-weight: bold; margin: 12px 0;">
            ${changeTitle}: <span style="font-weight: normal;">${changeDetails}</span>
          </div>
          <p style="font-size: 12px; color: #666;">
            If you made this change, no action is needed. If you did not make this change, please contact our security team immediately.
          </p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter!.sendMail({
        from: ENV.SMTP_FROM,
        to: email,
        subject: `Security Alert: ${changeTitle} on your Amazon Account`,
        html,
      });
    } catch (err: any) {
      logger.error(`Error sending security alert to ${email}: ${err.message}`);
    }
  }
}

export const emailService = new EmailService();
