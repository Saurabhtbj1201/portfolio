// Email template for admin notification
export const adminNotificationTemplate = (contactData) => {
  const purposeMap = {
    hire: 'Hiring Inquiry',
    project: 'Project Collaboration',
    connect: 'General Connection',
    other: 'Other'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .form-data { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .data-row { display: flex; margin-bottom: 15px; align-items: flex-start; }
        .data-row:last-child { margin-bottom: 0; }
        .label { font-weight: 600; color: #4a5568; min-width: 100px; margin-right: 15px; }
        .value { color: #2d3748; flex: 1; word-break: break-word; }
        .purpose-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .hire { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
        .project { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; }
        .connect { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
        .other { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; }
        .message-box { background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-top: 10px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 New Contact Form Submission</h1>
          <p>Someone just reached out through your portfolio!</p>
        </div>
        
        <div class="content">
          <div class="form-data">
            <div class="data-row">
              <span class="label">Name:</span>
              <span class="value">${contactData.name}</span>
            </div>
            <div class="data-row">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${contactData.email}" style="color: #667eea;">${contactData.email}</a></span>
            </div>
            <div class="data-row">
              <span class="label">Phone:</span>
              <span class="value"><a href="tel:${contactData.phone}" style="color: #667eea;">${contactData.phone}</a></span>
            </div>
            <div class="data-row">
              <span class="label">Purpose:</span>
              <span class="value">
                <span class="purpose-badge ${contactData.purpose}">${purposeMap[contactData.purpose]}</span>
              </span>
            </div>
            <div class="data-row">
              <span class="label">Message:</span>
              <div class="value">
                <div class="message-box">${contactData.message}</div>
              </div>
            </div>
            <div class="data-row">
              <span class="label">Submitted:</span>
              <span class="value">${new Date(contactData.createdAt).toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/admin/contact" class="cta-button">View in Admin Panel</a>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent from your portfolio contact form.</p>
          <p>You can manage all contact submissions in your admin panel.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    New Contact Form Submission
    
    Name: ${contactData.name}
    Email: ${contactData.email}
    Phone: ${contactData.phone}
    Purpose: ${purposeMap[contactData.purpose]}
    
    Message:
    ${contactData.message}
    
    Submitted: ${new Date(contactData.createdAt).toLocaleString()}
    
    View in admin panel: ${process.env.CLIENT_URL}/admin/contact
  `;

  return { html, text };
};

// Email template for user confirmation
export const userConfirmationTemplate = (contactData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Contacting Me</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px 20px; color: #2d3748; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; color: #667eea; margin-bottom: 20px; }
        .message { margin-bottom: 20px; }
        .highlight-box { background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .social-links { text-align: center; margin: 30px 0; }
        .social-link { display: inline-block; margin: 0 10px; padding: 10px; border-radius: 50%; background: #f8fafc; color: #667eea; text-decoration: none; width: 40px; height: 40px; line-height: 20px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Thank You for Reaching Out!</h1>
          <p>Your message has been received successfully</p>
        </div>
        
        <div class="content">
          <div class="greeting">Hi ${contactData.name}! 👋</div>
          
          <div class="message">
            Thank you for taking the time to contact me through my portfolio website. I really appreciate your interest and the time you've invested in reaching out.
          </div>
          
          <div class="highlight-box">
            <p><strong>📧 Your message has been received and is being reviewed.</strong></p>
            <p>I typically respond to all inquiries within 24-48 hours. You'll hear back from me at this email address soon!</p>
          </div>
          
          <div class="message">
            In the meantime, feel free to:
            <ul>
              <li>🔍 Explore more of my work and projects on my portfolio</li>
              <li>🤝 Connect with me on social media platforms</li>
              <li>📄 Download my resume if you haven't already</li>
            </ul>
          </div>
          
          <div class="social-links">
            <a href="https://linkedin.com/in/saurabhtbj1201" class="social-link" target="_blank">💼</a>
            <a href="https://github.com/saurabhtbj1201" class="social-link" target="_blank">💻</a>
            <a href="https://twitter.com/saurabhtbj1201" class="social-link" target="_blank">🐦</a>
          </div>
          
          <div class="signature">
            <p>Best regards,<br>
            <strong>Saurabh Kumar</strong><br>
            Full Stack Developer<br>
            📱 +91 9798024301<br>
            📧 Saurabhtbj143@gmail.com</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated confirmation email. Please do not reply to this email.</p>
          <p>If you have any urgent concerns, feel free to call me directly.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Thank You for Reaching Out!
    
    Hi ${contactData.name}!
    
    Thank you for taking the time to contact me through my portfolio website. I really appreciate your interest and the time you've invested in reaching out.
    
    Your message has been received and is being reviewed. I typically respond to all inquiries within 24-48 hours. You'll hear back from me at this email address soon!
    
    In the meantime, feel free to explore more of my work and projects on my portfolio or connect with me on social media platforms.
    
    Best regards,
    Saurabh Kumar
    Full Stack Developer
    Phone: +91 9798024301
    Email: Saurabhtbj143@gmail.com
    
    ---
    This is an automated confirmation email. Please do not reply to this email.
    If you have any urgent concerns, feel free to call me directly.
  `;

  return { html, text };
};
