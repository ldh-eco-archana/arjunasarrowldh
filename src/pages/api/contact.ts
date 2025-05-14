import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Initialize Resend with your API key
// Get your API key from https://resend.com
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Simple email validation regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    // HTML email template for admin notification
    const adminHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New Inquiry</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #e1e1e1;
      border-radius: 5px;
    }
    .header {
      background-color: #f5f5f5;
      padding: 15px;
      border-bottom: 2px solid #4caf50;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }
    .content {
      padding: 0 15px;
    }
    .field {
      margin-bottom: 15px;
    }
    .field-label {
      font-weight: bold;
      color: #555;
    }
    .message-box {
      background-color: #f9f9f9;
      padding: 15px;
      border-left: 3px solid #4caf50;
      margin-top: 10px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      text-align: center;
      border-top: 1px solid #e1e1e1;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Inquiry from Website</h1>
    </div>
    <div class="content">
      <div class="field">
        <span class="field-label">Name:</span> ${name}
      </div>
      <div class="field">
        <span class="field-label">Email:</span> <a href="mailto:${email}">${email}</a>
      </div>
      <div class="field">
        <span class="field-label">Phone:</span> ${phone || 'Not provided'}
      </div>
      <div class="field">
        <span class="field-label">Message:</span>
        <div class="message-box">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>
    <div class="footer">
      This email was sent from the contact form on Arjuna's Arrow website.
    </div>
  </div>
</body>
</html>
    `;

    // HTML email template for auto-response to the sender
    const autoResponseHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Thank You for Your Message</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #e1e1e1;
      border-radius: 5px;
    }
    .header {
      background-color: #4caf50;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      border-radius: 5px 5px 0 0;
    }
    .header h1 {
      margin: 0;
      color: white;
      font-size: 24px;
    }
    .content {
      padding: 0 15px;
    }
    p {
      margin-bottom: 15px;
    }
    .highlight {
      background-color: #f9f9f9;
      padding: 15px;
      border-left: 3px solid #4caf50;
      margin: 20px 0;
    }
    .contact-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      text-align: center;
      border-top: 1px solid #e1e1e1;
      padding-top: 15px;
    }
    .social-links {
      text-align: center;
      margin-top: 15px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #4caf50;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      background-color: #4caf50;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Contacting Us!</h1>
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      
      <p>Thank you for reaching out to Arjuna's Arrow. We have received your message and appreciate your interest in our economics coaching services.</p>
      
      <div class="highlight">
        <p>Our team will review your inquiry and get back to you as soon as possible, usually within 24-48 hours.</p>
      </div>
      
      <p>Here's a summary of the information you provided:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ''}
      </ul>
      
      <p>If you have any urgent questions, please don't hesitate to contact us directly:</p>
      
      <div class="contact-info">
        <p><strong>Email:</strong> arjunasarrowldh@gmail.com</p>
        <p><strong>Location:</strong> 1254 MIG, 32 Sec, Chandigarh Road, Ludhiana</p>
      </div>
      
      <p style="text-align: center; margin-top: 25px;">
        <a href="https://www.arjunasarrow.in" class="button">Visit Our Website</a>
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated response. Please do not reply to this email.</p>
      <p>&copy; 2025 Arjuna's Arrow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // If API key is not set, return mock success for development
    if (!resend) {
      console.log('Resend API key not found, sending mock emails:');
      console.log('\n1. ADMIN NOTIFICATION EMAIL:');
      console.log('To: arjunasarrowldh@gmail.com');
      console.log(`Subject: Arjuna's Arrow | New Inquiry from ${name}`);
      console.log('HTML email would be sent in production mode');
      
      console.log('\n2. AUTO-RESPONSE EMAIL:');
      console.log(`To: ${email}`);
      console.log('Subject: Thank you for contacting Arjuna\'s Arrow');
      console.log('HTML auto-response would be sent in production mode');
      
      return res.status(200).json({ 
        success: true, 
        data: { id: 'mock-email-id' },
        mode: 'development' 
      });
    }

    // Send admin notification email
    const adminEmailData = await resend.emails.send({
      from: 'Arjuna\'s Arrow <no-reply@arjunasarrow.in>', // Use your verified domain once set up
      to: 'arjunasarrowldh@gmail.com',
      subject: `Arjuna's Arrow | New Inquiry from ${name}`,
      html: adminHtmlContent,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
      `, // Fallback plain text version
    });

    console.log('Admin notification email sent:', adminEmailData);

    try {
      // Send auto-response to the inquirer
      const autoResponseData = await resend.emails.send({
        from: 'Arjuna\'s Arrow <no-reply@arjunasarrow.in>', // Use your verified domain once set up
        to: email,
        subject: 'Thank you for contacting Arjuna\'s Arrow',
        html: autoResponseHtmlContent,
        text: `
Dear ${name},

Thank you for reaching out to Arjuna's Arrow. We have received your message and appreciate your interest in our economics coaching services.

Our team will review your inquiry and get back to you as soon as possible, usually within 24-48 hours.

If you have any urgent questions, please don't hesitate to contact us directly:

Email: arjunasarrowldh@gmail.com
Location: 1254 MIG, 32 Sec, Chandigarh Road, Ludhiana

This is an automated response. Please do not reply to this email.

© 2025 Arjuna's Arrow. All rights reserved.
        `, // Fallback plain text version
      });

      console.log('Auto-response email sent:', autoResponseData);

      return res.status(200).json({ 
        success: true, 
        data: { 
          adminEmail: adminEmailData, 
          autoResponse: autoResponseData 
        } 
      });
    } catch (error: any) {
      console.error('Error sending auto-response email:', error);
      
      // Even if auto-response fails, return success for the admin email
      return res.status(200).json({ 
        success: true, 
        data: { 
          adminEmail: adminEmailData,
          autoResponseError: error.message || 'Failed to send auto-response'
        } 
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
} 