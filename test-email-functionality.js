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
      
      if (res.statusCode === 200) {
        console.log('\nVerification test successful. Check your email inbox (and spam folder) for the test email.');
        console.log('\n-------------------------------------------------\n');
        
        // Now test the contact form endpoint
        console.log('Step 2: Testing contact form endpoint...');
        testContactForm();
      } else {
        console.error('\nVerification test failed. Check the response for details.');
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
        
        if (res.statusCode === 200) {
          console.log('\nContact form test successful. You should receive:');
          console.log('1. An admin notification email to arjunasarrowldh@gmail.com');
          console.log(`2. An auto-response email to ${testEmail}`);
          console.log('\nPlease check both email inboxes (and spam folders).');
        } else {
          console.error('\nContact form test failed. Check the response for details.');
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