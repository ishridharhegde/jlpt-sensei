import Papa from 'papaparse';

/**
 * Get all sheets (tabs) from a Google Spreadsheet by trying common JLPT level names
 * @param {string} spreadsheetId - The spreadsheet ID
 * @returns {Promise<Array>} Array of sheet objects with title
 */
export async function getAllSheets(spreadsheetId) {
  const discoveredSheets = [];
  const seenContent = new Set(); // Track unique content to avoid duplicates
  
  // Common JLPT level names to try
  const commonSheetNames = ['N5', 'N4', 'N3', 'N2', 'N1'];
  
  for (const sheetName of commonSheetNames) {
    try {
      const testUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        const text = await response.text();
        
        // Skip if empty or no data
        if (!text || text.trim().length === 0) continue;
        
        // Parse to check if it has valid vocabulary structure
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) continue; // Need at least header + 1 row
        
        // Check if first line has required columns
        const headerLine = lines[0].toLowerCase();
        const hasJapanese = headerLine.includes('japanese');
        const hasEnglish = headerLine.includes('english');
        
        // Create a content fingerprint from first few rows to detect duplicates
        const contentFingerprint = lines.slice(0, Math.min(5, lines.length)).join('|');
        
        // Skip if we've seen this exact content before (Google Sheets returns default sheet for non-existent names)
        if (seenContent.has(contentFingerprint)) {
          console.log(`Skipping ${sheetName} - same content as another sheet (likely doesn't exist)`);
          continue;
        }
        
        // Only include sheets with proper vocabulary structure
        if (hasJapanese && hasEnglish) {
          discoveredSheets.push({
            title: sheetName
          });
          seenContent.add(contentFingerprint);
        }
      }
    } catch (error) {
      // This sheet doesn't exist or is inaccessible, continue
      continue;
    }
  }
  
  return discoveredSheets;
}

/**
 * Convert Google Sheets URL to CSV export URL
 * @param {string} sheetUrl - Full Google Sheets URL
 * @param {string} sheetName - Sheet name (tab name)
 * @returns {string} CSV export URL
 */
export function getCSVExportUrl(sheetUrl, sheetName) {
  // Extract spreadsheet ID from URL
  // Support various URL formats
  let match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  
  // Try alternative format (edit URL)
  if (!match) {
    match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)\/edit/);
  }
  
  // Try export URL format
  if (!match) {
    match = sheetUrl.match(/export\/([a-zA-Z0-9-_]+)/);
  }
  
  if (!match) {
    throw new Error('Invalid Google Sheets URL. Please use the full URL from your browser address bar.');
  }
  
  const spreadsheetId = match[1];
  
  // Use sheet name parameter like Flutter app
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

/**
 * Fetch and parse CSV data from Google Sheets
 * @param {string} csvUrl - CSV export URL
 * @returns {Promise<Array>} Parsed CSV data
 */
export async function fetchCSVData(csvUrl) {
  try {
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to fetch data (${response.status}): ${response.statusText}. ${errorText ? 'Response: ' + errorText.substring(0, 100) : 'The sheet may be private or the URL is incorrect.'}`);
    }
    
    const csvText = await response.text();
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Received empty data from Google Sheets');
    }
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            reject(new Error('No data found in the sheet'));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to Google Sheets. Please check your internet connection and make sure the sheet is publicly accessible.');
    }
    throw error;
  }
}

/**
 * Sync vocabulary data from Google Sheets
 * @param {string} sheetUrl - Google Sheets URL
 * @param {string} level - Sheet title/level name
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Sync result with counts
 */
export async function syncLevelData(sheetUrl, level, onProgress) {
  try {
    onProgress?.({ level, status: 'fetching' });
    
    const csvUrl = getCSVExportUrl(sheetUrl, level);
    const data = await fetchCSVData(csvUrl);
    
    onProgress?.({ level, status: 'parsing', total: data.length });
    
    // Check if data has the required columns
    if (data.length === 0) {
      throw new Error('Sheet is empty');
    }
    
    const firstRow = data[0];
    if (!firstRow.Japanese && !firstRow.English) {
      throw new Error('Sheet must have "Japanese" and "English" columns');
    }
    
    // Transform CSV data to vocabulary words
    const words = data
      .filter(row => row.Japanese && row.English)
      .map(row => ({
        level,
        lesson: row.Lesson || 'KANJI',
        japanese: row.Japanese.trim(),
        english: row.English.trim(),
        createdAt: new Date().toISOString()
      }));
    
    onProgress?.({ level, status: 'complete', added: words.length });
    
    return { words, added: words.length };
  } catch (error) {
    onProgress?.({ level, status: 'error', error: error.message });
    throw error;
  }
}

/**
 * Sync all sheets from a Google Spreadsheet
 * @param {string} sheetUrl - Google Sheets URL
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Sync results
 */
export async function syncAllSheets(sheetUrl, onProgress) {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/) ||
                sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)\/edit/);
  
  if (!match) {
    throw new Error('Invalid Google Sheets URL');
  }
  
  const spreadsheetId = match[1];
  
  // Get all sheets
  onProgress?.({ level: 'Discovering sheets', status: 'fetching' });
  const sheets = await getAllSheets(spreadsheetId);
  
  if (sheets.length === 0) {
    throw new Error('No sheets found. Make sure: 1) Sheet is public (Anyone with link can view), 2) Sheet has at least one tab with data');
  }
  
  onProgress?.({ level: `Found ${sheets.length} sheet(s)`, status: 'fetching' });
  
  const results = {};
  
  for (const sheet of sheets) {
    try {
      const result = await syncLevelData(sheetUrl, sheet.title, onProgress);
      
      // Skip sheets with no data
      if (!result.words || result.words.length === 0) {
        console.log(`Skipping ${sheet.title} - no valid vocabulary data`);
        continue;
      }
      
      results[sheet.title] = result;
    } catch (error) {
      console.error(`Error syncing ${sheet.title}:`, error);
      // Don't include failed sheets in results
      continue;
    }
  }
  
  if (Object.keys(results).length === 0) {
    throw new Error('No valid vocabulary data found in any sheet. Make sure sheets have columns: Lesson, Japanese, English');
  }
  
  return results;
}

/**
 * Get default GID for a level
 * @param {string} level - JLPT level
 * @returns {string} GID
 */
export function getDefaultGID(level) {
  return DEFAULT_GIDS[level] || '0';
}

/**
 * Validate Google Sheets URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export function validateSheetsUrl(url) {
  if (!url) return false;
  // Support multiple URL formats
  return /\/spreadsheets\/d\/[a-zA-Z0-9-_]+/.test(url) || 
         /\/d\/[a-zA-Z0-9-_]+\/edit/.test(url) ||
         /export\/[a-zA-Z0-9-_]+/.test(url);
}

/**
 * Test if a Google Sheets URL is accessible
 * @param {string} sheetUrl - Google Sheets URL
 * @param {string} sheetName - Sheet name to test (default: 'N5')
 * @returns {Promise<Object>} Test result with success status and message
 */
export async function testSheetAccess(sheetUrl, sheetName = 'N5') {
  try {
    const csvUrl = getCSVExportUrl(sheetUrl, sheetName);
    const response = await fetch(csvUrl, {
      method: 'HEAD',
      mode: 'cors'
    });
    
    if (response.ok) {
      return { success: true, message: `Sheet "${sheetName}" is accessible` };
    } else {
      return { 
        success: false, 
        message: `Sheet returned ${response.status}. Make sure the sheet is set to "Anyone with the link can view"`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Unable to access sheet. Please ensure: 1) The sheet is public, 2) You have internet connection, 3) The URL is correct'
    };
  }
}
