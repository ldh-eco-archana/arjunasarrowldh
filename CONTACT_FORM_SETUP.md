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
   The default is `'Arjuna's Arrow <onboarding@resend.dev>'`. 
   
   For production, you should set up a verified domain in your Resend account and use an email from that domain.

5. Restart your development server for the changes to take effect.

## Features

- **Email Validation**: The form performs validation on both the frontend and API side to ensure email addresses are valid.
- **HTML Email Templates**: Emails are sent with a professionally styled HTML template for better readability.
- **Auto-Response**: Automatically sends a thank you email to users who submit the form.
- **Fallback Text Version**: A plain text version is included for email clients that don't support HTML.
- **Development Mode**: If no API key is provided, the system will run in development mode, logging email content to the console.

## Testing Without API Key

If no API key is provided, the contact form will work in "development mode" - it will log the email content to the console but won't actually send an email.

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
   - Send a test email to verify the connection to Resend
   - Submit a test form submission to check both admin notification and auto-response emails

3. **Browser Console**: The contact form component now logs detailed information about the email sending process. Open your browser's developer console to see this information when submitting the form.

### Troubleshooting Auto-Response Issues

If you're not receiving auto-response emails:

1. **Check Spam Folder**: Auto-response emails might be filtered into spam, especially when using the default Resend domain.

2. **Verify API Key**: Make sure your Resend API key is valid and has the necessary permissions.

3. **Check Console Logs**: The server logs will show detailed information about email sending attempts and errors.

4. **Email Rate Limits**: Be aware that Resend has rate limits for free accounts. Check the [Resend documentation](https://resend.com/docs/api-reference/rate-limits) for more details.

5. **Domain Verification**: For production use, verify your domain with Resend to improve deliverability.

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
   - Social media links
   - The call-to-action button
   - Brand colors and styling

### Plain Text Fallback

For email clients that don't support HTML, you can edit the text templates in the `text` fields of both email sending functions. 