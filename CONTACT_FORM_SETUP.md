# Contact Form Setup

The contact form now uses [Resend](https://resend.com) to send emails when users submit inquiries.

## Configuration Steps

1. Create a [Resend](https://resend.com) account if you don't have one already.

2. Get your API key from the [Resend dashboard](https://resend.com/api-keys).

3. Create a `.env.local` file in the root of your project with the following content:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   ```
   Replace `your_resend_api_key_here` with your actual Resend API key.

4. (Optional) To configure the sender email address, modify the `from` field in `src/pages/api/contact.ts`. 
   The default is `'Arjuna's Arrow <no-reply@arjunasarrow.in>'`. 
   
   For production, you should set up a verified domain in your Resend account and use an email from that domain.

5. Restart your development server for the changes to take effect.

## Features

- **Email Validation**: The form performs validation on both the frontend and API side to ensure email addresses are valid.
- **HTML Email Templates**: Emails are sent with a professionally styled HTML template for better readability.
- **Auto-Response**: Automatically sends a thank you email to users who submit the form.
- **Fallback Text Version**: A plain text version is included for email clients that don't support HTML.
- **Development Mode**: If no API key is provided, the system will run in development mode, logging email content to the console.

## Development Mode vs. Production Mode

### Development Mode
When no Resend API key is configured, the system operates in "development mode":

1. **Form Submissions**: The form will accept submissions and process them normally
2. **Visual Feedback**: Users will see a warning message indicating they're in development mode
3. **No Emails Sent**: No actual emails are sent to either admin or users
4. **Console Logging**: Email content is logged to the server console for verification
5. **Status**: The API endpoints return a special `isDevelopment: true` flag

This allows developers to test the form functionality without setting up a Resend account or API key.

### Production Mode
When a valid Resend API key is provided, the system operates in "production mode":

1. **Full Functionality**: Both admin notifications and auto-response emails are sent
2. **Success Messages**: Users receive confirmation that their message was sent
3. **Email Tracking**: Email sending status is tracked and reported

## Testing Without API Key

If no API key is provided, the contact form will work in "development mode" - it will log the email content to the console but won't actually send an email. The user interface will display a warning message to indicate this.

## Testing Email Functionality

To verify that the email functionality is working properly, we've included two testing tools:

1. **Verification API Endpoint**: You can test if your Resend API key is working by sending a request to `/api/verify-email` with an email address.

2. **Testing Script**: Use the `test-email-functionality.js` script to test both the verification endpoint and the contact form endpoint:
   
   ```bash
   # First, edit the script to use your test email address
   # Then run:
   node test-email-functionality.js
   ```

   This script will:
   - Detect if you're running in development or production mode
   - Send a test email to verify the connection to Resend (in production mode)
   - Submit a test form submission to check both admin notification and auto-response emails
   - Provide clear instructions based on your environment

3. **Browser Console**: The contact form component now logs detailed information about the email sending process. Open your browser's developer console to see this information when submitting the form.

### Troubleshooting Auto-Response Issues

If you're not receiving auto-response emails:

1. **Check Development Mode**: Make sure you have set up a Resend API key in your .env.local file. Look for development mode warnings.

2. **Check Spam Folder**: Auto-response emails might be filtered into spam, especially when using the default Resend domain.

3. **Verify API Key**: Make sure your Resend API key is valid and has the necessary permissions.

4. **Check Console Logs**: The server logs will show detailed information about email sending attempts and errors.

5. **Email Rate Limits**: Be aware that Resend has rate limits for free accounts. Check the [Resend documentation](https://resend.com/docs/api-reference/rate-limits) for more details.

6. **Domain Verification**: For production use, verify your domain with Resend to improve deliverability.

## Customizing Email Content

### Admin Notification Email

This is the email sent to the site administrator when someone submits the contact form. To modify this email:

1. Edit the `adminHtmlContent` template in `src/pages/api/contact.ts`
2. You can change colors, styling, layout, and content as needed

### Auto-Response Email

This is the thank you email automatically sent to users after they submit the form. To modify this email:

1. Edit the `autoResponseHtmlContent` template in `src/pages/api/contact.ts` 
2. You can customize:
   - The header and footer design
   - The message content
   - Contact information
   - Brand colors and styling

### Plain Text Fallback

For email clients that don't support HTML, you can edit the text templates in the `text` fields of both email sending functions. 