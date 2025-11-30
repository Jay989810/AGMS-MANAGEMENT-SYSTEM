# SMS Configuration Check Guide

## Required Environment Variables for Bulk SMS Nigeria

To send SMS messages, you need to configure the following variables in your `.env.local` file:

### For Bulk SMS Nigeria (Recommended):
```env
SMS_PROVIDER=bulksmsnigeria
SMS_USERNAME=your-bulk-sms-username
SMS_PASSWORD=your-bulk-sms-api-key-or-password
SMS_SENDER_ID=your-approved-sender-id
```

### Common Issues:

1. **Missing Variables**: If you see an error like "Missing environment variables: SMS_USERNAME, SMS_PASSWORD, SMS_SENDER_ID"
   - Check your `.env.local` file exists
   - Make sure all three variables are set
   - Restart your development server after adding variables

2. **500 Error**: This usually means:
   - The credentials are incorrect
   - The sender ID is not approved/registered
   - The API endpoint is unreachable
   - Check the browser console for detailed error messages

3. **0 recipients sent, all failed**:
   - Check that phone numbers in your database are valid
   - Verify the phone number format (should work with or without country code)
   - Check the error details in the console

### How to Get Bulk SMS Nigeria Credentials:

1. Sign up at [eBulkSMS](https://www.ebulksms.com/) or [BulkSMSNigeria](https://www.bulksmsnigeria.com/)
2. Get your username and API key/password from your account dashboard
3. Register/approve a sender ID (usually your organization name like "CHURCH" or "AMAZINGGRACE")
4. Add these to your `.env.local` file

### Testing Your Configuration:

1. Make sure `.env.local` is in your project root (same folder as `package.json`)
2. The file should look like:
   ```
   SMS_PROVIDER=bulksmsnigeria
   SMS_USERNAME=myusername
   SMS_PASSWORD=myapikey123
   SMS_SENDER_ID=CHURCH
   ```
3. Restart your Next.js development server (`npm run dev`)
4. Try sending a test SMS to a valid phone number

### Debugging:

- Check the browser console for detailed error messages
- Check the server logs (terminal where you run `npm run dev`)
- The errors array in the response will contain detailed information about what went wrong

