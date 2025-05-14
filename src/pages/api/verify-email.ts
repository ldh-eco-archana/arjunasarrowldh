import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Initialize Resend with your API key
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    if (!resend) {
      return res.status(200).json({
        success: true,
        mode: 'development',
        isDevelopment: true,
        message: 'No Resend API key provided. In development mode, emails are only logged and not actually sent.'
      });
    }

    // Send a test email
    const data = await resend.emails.send({
      from: 'Arjuna\'s Arrow <no-reply@arjunasarrow.in>',
      to: email,
      subject: 'Email Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
          <h1 style="color: #4caf50;">Email Test Successful</h1>
          <p>This is a test email from Arjuna's Arrow contact form system.</p>
          <p>If you're receiving this email, it means our email system is working correctly.</p>
          <p>This confirms that both the admin notification and auto-response emails should work properly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This is an automated test email. Please do not reply.</p>
        </div>
      `,
      text: 'Email Test Successful. This is a test email from Arjuna\'s Arrow contact form system. If you\'re receiving this email, it means our email system is working correctly.',
    });

    return res.status(200).json({
      success: true,
      data,
      message: 'Test email sent successfully. Please check your inbox (and spam folder).'
    });
  } catch (error: unknown) {
    console.error('Error sending test email:', error);
    return res.status(500).json({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 