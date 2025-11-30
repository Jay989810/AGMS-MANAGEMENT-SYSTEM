# SMS Configuration Check Guide

## Required Environment Variables for Bulk SMS Nigeria

To send SMS messages, you need to configure the following variables in your `.env.local` file:

### For Bulk SMS Nigeria v3 API (Recommended - Bearer Tokens):
```env
SMS_PROVIDER=bulksmsnigeria
SMS_PASSWORD=your-bearer-api-token-from-v3
SMS_SENDER_ID=your-approved-sender-id
```

**Note:** 
- `SMS_USERNAME` is NOT required for Bulk SMS Nigeria v3/v2 API
- `SMS_PASSWORD` should contain your **Bearer API Token** from v3 API (with named tokens and granular permissions)
- System automatically uses v3 API first, falls back to v2 if needed
- Get your Bearer token from: BulkSMS Nigeria Dashboard → Bearer API Tokens → Generate New Bearer Token
- Your `SMS_SENDER_ID` must be approved/registered (max 11 characters, e.g., "AMAZINGGRACE")
- The Bearer token provides more security with named tokens and granular permissions

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

1. Sign up at [BulkSMS Nigeria](https://www.bulksmsnigeria.com/)
2. Go to Dashboard → **Bearer API Tokens** section
3. Click **"Generate New Bearer Token"**
4. Name your token (e.g., "CHURCH") - this is for identification only
5. Copy the generated **Bearer Token** (this is your API token)
6. Register/approve a sender ID (usually your organization name like "AMAZINGGRACE" - max 11 characters)
7. Add these to your `.env.local` file:
   ```
   SMS_PROVIDER=bulksmsnigeria
   SMS_PASSWORD=your-bearer-token-here
   SMS_SENDER_ID=your-approved-sender-id
   ```

**Important:** Use the Bearer API Token from the v3 system (Bearer API Tokens section). This provides better security with named tokens and granular permissions.

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

