// A simple script to test the email functionality of the contact form
// Run this with: node test-email-functionality.js
const https = require('https');
const http = require('http');

// Change this to your test email
const testEmail = 'yashbsr3@gmail.com';

// Configuration
const config = {
  hostname: 'localhost',
  port: 3000, // Update this if your Next.js app runs on a different port
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Test the verification endpoint first
console.log('Step 1: Testing verification endpoint...');

const verifyData = JSON.stringify({
  email: testEmail,
});

const verifyReq = http.request(
  {
    ...config,
    path: '/api/verify-email',
  },
  (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Verification Response Status:', res.statusCode);
      console.log('Verification Response Headers:', res.headers);
      console.log('Verification Response Body:', data);
      
      try {
        const parsedData = JSON.parse(data);
        
        if (res.statusCode === 200) {
          if (parsedData.isDevelopment) {
            console.log('\n⚠️ DEVELOPMENT MODE DETECTED ⚠️');
            console.log('No Resend API key is configured. Emails are not being sent.');
            console.log('To enable email sending, add a Resend API key to your .env.local file.');
            console.log('\nContinuing with contact form test in development mode...');
            console.log('\n-------------------------------------------------\n');
            console.log('Step 2: Testing contact form endpoint...');
            testContactForm();
          } else {
            console.log('\nVerification test successful. Check your email inbox (and spam folder) for the test email.');
            console.log('\n-------------------------------------------------\n');
            console.log('Step 2: Testing contact form endpoint...');
            testContactForm();
          }
        } else {
          console.error('\nVerification test failed. Check the response for details.');
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        console.error('\nVerification test failed. Invalid response format.');
      }
    });
  }
);

verifyReq.on('error', (error) => {
  console.error('Error with verification request:', error);
});

verifyReq.write(verifyData);
verifyReq.end();

function testContactForm() {
  const contactData = JSON.stringify({
    name: 'Test User',
    email: testEmail,
    phone: '1234567890',
    message: 'This is a test message to verify the contact form functionality.',
  });

  const contactReq = http.request(
    {
      ...config,
      path: '/api/contact',
    },
    (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Contact Form Response Status:', res.statusCode);
        console.log('Contact Form Response Headers:', res.headers);
        console.log('Contact Form Response Body:', data);
        
        try {
          const parsedData = JSON.parse(data);
          
          if (res.statusCode === 200) {
            if (parsedData.isDevelopment) {
              console.log('\n⚠️ DEVELOPMENT MODE RESULTS ⚠️');
              console.log('Your form submission was processed successfully, but no emails were sent.');
              console.log('In development mode (without Resend API key), emails are only logged to the console.');
              console.log('\nTo enable actual email sending:');
              console.log('1. Create a Resend account at https://resend.com');
              console.log('2. Get your API key from the Resend dashboard');
              console.log('3. Add it to your .env.local file as RESEND_API_KEY=your_key_here');
            } else {
              console.log('\nContact form test successful. You should receive:');
              console.log('1. An admin notification email to arjunasarrowldh@gmail.com');
              console.log(`2. An auto-response email to ${testEmail}`);
              console.log('\nPlease check both email inboxes (and spam folders).');
            }
          } else {
            console.error('\nContact form test failed. Check the response for details.');
          }
        } catch (e) {
          console.error('Error parsing response:', e);
          console.error('\nContact form test failed. Invalid response format.');
        }
      });
    }
  );

  contactReq.on('error', (error) => {
    console.error('Error with contact form request:', error);
  });

  contactReq.write(contactData);
  contactReq.end();
} 