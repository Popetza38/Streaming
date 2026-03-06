import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

let docPromise = null;

async function getSheetsDoc() {
  if (docPromise) return docPromise;

  docPromise = (async () => {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.SPREADSHEET_ID;

    if (!email || !key || !sheetId) {
      docPromise = null;
      console.error('Missing env vars:', { email: !!email, key: !!key, sheetId: !!sheetId });
      throw new Error('Google Sheets credentials are not properly configured.');
    }

    // Diagnostic check for the key format (without logging the secret part)
    if (!key || !key.includes('BEGIN PRIVATE KEY')) {
      console.error('Private key format error: Missing BEGIN PRIVATE KEY header');
      docPromise = null;
      throw new Error('Invalid GOOGLE_PRIVATE_KEY format. Ensure it starts with -----BEGIN PRIVATE KEY-----');
    }

    const serviceAccountAuth = new JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  })();

  return docPromise;
}

export { getSheetsDoc };
