import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { OAuth2Client } from 'google-auth-library'

interface SheetData {
  dates: string[]
  values: number[]
}

export async function getSheetData(spreadsheetUrl: string): Promise<SheetData> {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.accessToken) {
      throw new Error('No access token available')
    }

    // Create OAuth2 client properly
    const oauth2Client = new OAuth2Client()
    oauth2Client.setCredentials({ access_token: session.accessToken })

    // Initialize sheets with proper auth
    const sheets = google.sheets({ 
      version: 'v4', 
      auth: oauth2Client 
    })

    // Extract spreadsheet ID from URL
    const matches = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (!matches) throw new Error('Invalid Google Sheets URL')
    const spreadsheetId = matches[1]

    // Get the first sheet's data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:B', // Assumes dates in column A and values in column B
    })

    const rows = response.data.values || []
    
    // Skip header row and process data
    const data = rows.slice(1).reduce<SheetData>(
      (acc, [date, value]) => {
        if (date && !isNaN(Number(value))) {
          acc.dates.push(date)
          acc.values.push(Number(value))
        }
        return acc
      },
      { dates: [], values: [] }
    )

    return data
  } catch (error) {
    console.error('Failed to fetch sheet data:', error)
    throw new Error('Failed to fetch spreadsheet data')
  }
}

// Helper function to convert sheet data to trend data format
export function convertSheetDataToTrendData(data: SheetData) {
  const dates = data.dates.map(date => new Date(date))
  const values = data.values
  
  // Normalize values to 0-100 scale
  const maxValue = Math.max(...values)
  const normalizedValues = values.map(value => Math.round((value / maxValue) * 100))
  
  return {
    dates,
    values: normalizedValues
  }
} 