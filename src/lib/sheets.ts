import { google } from 'googleapis';
import { UTMTag } from '@/types/utm';

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.');
  }
  const parsed = JSON.parse(credentials);
  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error('GOOGLE_SHEET_ID 환경 변수가 설정되지 않았습니다.');
  }
  return id;
}

export async function appendToSheet(tag: UTMTag): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = getSheetId();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'UTM태그!A:M',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        tag.id,
        tag.title,
        tag.brand,
        tag.product,
        tag.landingUrl,
        tag.utmSource,
        tag.utmMedium,
        tag.utmCampaign,
        tag.utmTerm,
        tag.utmContent,
        tag.generatedUrl,
        tag.createdAt,
      ]],
    },
  });
}

export async function syncAllToSheet(tags: UTMTag[]): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = getSheetId();

  const headers = [
    ['ID', '태그 제목', '브랜드', '제품', '랜딩 URL',
     'Source', 'Medium', 'Campaign', 'Term', 'Content',
     '생성된 URL', '생성일']
  ];

  const rows = tags.map(tag => [
    tag.id,
    tag.title,
    tag.brand,
    tag.product,
    tag.landingUrl,
    tag.utmSource,
    tag.utmMedium,
    tag.utmCampaign,
    tag.utmTerm,
    tag.utmContent,
    tag.generatedUrl,
    tag.createdAt,
  ]);

  // Clear and rewrite
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: 'UTM태그!A:M',
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'UTM태그!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [...headers, ...rows],
    },
  });
}

export async function deleteFromSheet(tagId: string): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = getSheetId();

  // Find the row with the tag ID
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'UTM태그!A:A',
  });

  const rows = response.data.values;
  if (!rows) return;

  const rowIndex = rows.findIndex(row => row[0] === tagId);
  if (rowIndex === -1) return;

  // Get sheet ID
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = sheetMeta.data.sheets?.find(s => s.properties?.title === 'UTM태그');
  const sheetId = sheet?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    },
  });
}
