import type { ContactNotificationData } from '../email.types';

/**
 * HTML email template for contact form notifications
 */
export function contactMessageTemplate(data: ContactNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Message</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .info-grid {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      margin-bottom: 12px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      min-width: 120px;
    }
    .info-value {
      color: #333;
      word-break: break-word;
    }
    .message-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .message-box p {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #667eea;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Contact Message</h1>
    </div>
    
    <div class="content">
      <p>You've received a new message from your portfolio website.</p>
      
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">From:</span>
          <span class="info-value">${escapeHtml(data.name)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${data.submittedAt.toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Message ID:</span>
          <span class="info-value"><code>${data.messageId}</code></span>
        </div>
        ${
          data.ipAddress
            ? `
        <div class="info-row">
          <span class="info-label">IP Address:</span>
          <span class="info-value"><code>${data.ipAddress}</code></span>
        </div>
        `
            : ''
        }
      </div>
      
      <div class="divider"></div>
      
      <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">Message:</h2>
      <div class="message-box">
        <p>${escapeHtml(data.message)}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="mailto:${escapeHtml(data.email)}?subject=Re: Your message from portfolio" class="button">
          Reply to ${escapeHtml(data.name)}
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p>This email was sent from your portfolio contact form.</p>
      <p style="margin-top: 10px; font-size: 12px; color: #999;">
        Message received at ${data.submittedAt.toISOString()}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}
