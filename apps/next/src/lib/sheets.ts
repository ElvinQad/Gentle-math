import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/db';

interface SheetData {
  dates: string[];
  values: number[];
  ageSegments: Array<{ name: string; value: number }>;
}

export async function getSheetData(spreadsheetUrl: string): Promise<SheetData> {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      throw new Error('Authentication required');
    }

    // Get the user's sheets token
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        sheetsAccessToken: true,
        sheetsTokenExpiry: true,
      },
    });

    if (!user?.sheetsAccessToken) {
      throw new Error('Google Sheets access not granted. Please connect your Google Sheets account first.');
    }

    // Check if token is expired
    if (user.sheetsTokenExpiry && new Date(user.sheetsTokenExpiry) < new Date()) {
      throw new Error('Google Sheets access token expired. Please reconnect your account.');
    }

    // Create OAuth2 client with sheets token
    const oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
    
    oauth2Client.setCredentials({
      access_token: user.sheetsAccessToken,
    });

    // Initialize sheets with proper auth
    const sheets = google.sheets({
      version: 'v4',
      auth: oauth2Client,
    });

    // Extract spreadsheet ID from URL
    const matches = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!matches) {
      throw new Error('Invalid Google Sheets URL format');
    }
    const spreadsheetId = matches[1];

    // Get the first sheet's data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:D', // Update range to include all columns
    });

    if (!response.data.values || response.data.values.length <= 1) {
      throw new Error('Spreadsheet is empty or missing required data');
    }

    const rows = response.data.values;
    console.log('Raw spreadsheet data:', rows);

    // Skip header row and process data
    const data = rows.slice(1).reduce<{
      dates: string[];
      values: number[];
      ageSegments: { name: string; value: number }[];
    }>((acc, row) => {
      const [date, trend, segment, percent] = row;
      console.log('Processing row:', { date, trend, segment, percent });
      
      // Process date and trend value
      if (date && !isNaN(Number(trend))) {
        // Parse date in DD.MM.YYYY format
        const [day, month, year] = date.split('.');
        if (day && month && year) {
          const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
          if (!isNaN(parsedDate.getTime())) {
            // Only add the date and value if trend is not empty
            if (trend.trim() !== '') {
              const parsedValue = Number(trend);
              console.log('Adding data point:', { 
                date: parsedDate.toISOString(), 
                value: parsedValue,
                originalValue: trend 
              });
              acc.dates.push(parsedDate.toISOString().split('T')[0]);
              acc.values.push(parsedValue);
            }
          }
        }
      }

      // Process age segments (only for rows that have segment data)
      if (segment && !isNaN(Number(percent))) {
        acc.ageSegments.push({
          name: segment,
          value: Number(percent)
        });
      }

      return acc;
    }, { dates: [], values: [], ageSegments: [] });

    if (data.dates.length === 0 || data.values.length === 0) {
      throw new Error('No valid data found in the spreadsheet');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch sheet data:', error);
    throw error;
  }
}

// Helper function to convert sheet data to trend data format
export function convertSheetDataToTrendData(data: SheetData) {
  const dates = data.dates.map((date) => new Date(date));
  const values = data.values;

  const result = {
    dates,
    values,
    ageSegments: data.ageSegments
  };
  
  console.log('Converted trend data:', result);
  return result;
}

export async function readSpreadsheet(userId: string, spreadsheetId: string, range: string) {
  try {
    // Get user's sheets token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sheetsAccessToken: true },
    });

    if (!user?.sheetsAccessToken) {
      throw new Error('No Sheets access token found');
    }

    // Call Google Sheets API
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        headers: {
          Authorization: `Bearer ${user.sheetsAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch spreadsheet data');
    }

    const data = await response.json();
    return data.values;
  } catch (error) {
    console.error('Error reading spreadsheet:', error);
    throw error;
  }
}
