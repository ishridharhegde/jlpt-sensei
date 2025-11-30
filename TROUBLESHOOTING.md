# Google Sheets Integration - Troubleshooting Guide

## The 400 Bad Request Error - SOLVED ✅

The error you encountered happens when Google Sheets blocks access. Here's what was fixed and how to resolve it:

## What Was Changed

### 1. **Better CSV Endpoint** 
Changed from `/export?format=csv` to `/gviz/tq?tqx=out:csv` which is more reliable for public sheets.

### 2. **Enhanced Error Messages**
Now shows specific, helpful error messages instead of generic ones.

### 3. **Test Connection Button**
Added ability to test if your sheet is accessible before syncing.

### 4. **Better URL Parsing**
Now supports multiple Google Sheets URL formats.

## How to Fix Your Issue

### Step 1: Make Your Sheet PUBLIC ⚠️ (MOST IMPORTANT)

1. Open your Google Sheet
2. Click the **"Share"** button (top right corner)
3. Click **"Change to anyone with the link"**
4. Make sure it's set to **"Viewer"** access
5. Click **"Done"**

**This is the #1 reason for 400 errors!**

### Step 2: Get the Correct URL

Use the **FULL URL** from your browser's address bar when viewing the sheet.

✅ **Correct URL format:**
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0
```

❌ **Don't use:**
- Export URLs that already have `/export/` in them
- Shortened URLs
- URLs without the spreadsheet ID

### Step 3: Test Connection

1. Paste your URL in the Settings screen
2. Click **"Save URL"**
3. Click **"Test Connection"** button (NEW!)
4. Wait for confirmation that the sheet is accessible
5. Only then click **"Sync Data"**

## Common Error Messages & Solutions

### 🔴 "400 Bad Request"
**Cause:** Sheet is private or URL is wrong
**Solution:** 
- Make sheet public (see Step 1)
- Check you're using the full URL
- Try the Test Connection button first

### 🔴 "Network error: Unable to connect"
**Cause:** No internet or CORS issue
**Solution:**
- Check internet connection
- Make sure sheet is public
- Try refreshing the page

### 🔴 "No data found in the sheet"
**Cause:** Sheet structure is incorrect
**Solution:**
- Check you have columns named exactly: **Lesson**, **Japanese**, **English**
- Make sure there's at least one row of data
- Check you're using the correct GID for each level

### 🔴 "Invalid Google Sheets URL"
**Cause:** URL format not recognized
**Solution:**
- Copy the full URL from browser address bar
- Don't use shortened or modified URLs
- URL should contain `/spreadsheets/d/`

## Correct Sheet Structure

### Required Columns (exact names)
```
| Lesson   | Japanese | English        |
|----------|----------|----------------|
| KANJI    | 食べる   | to eat         |
| Lesson01 | 行く     | to go          |
| Lesson01 | 来る     | to come        |
```

### Sub-Sheet Names
Create 5 tabs named exactly:
- **N5** (gid=0 by default)
- **N4** (gid=1 by default)
- **N3** (gid=2 by default)
- **N2** (gid=3 by default)
- **N1** (gid=4 by default)

## Finding GIDs (Advanced)

If your GIDs are different:

1. Click on a sub-sheet tab (e.g., N5)
2. Look at the URL in your browser
3. Find the `gid=` parameter
4. Example: `...#gid=123456` means GID is `123456`
5. Enter this number in the Settings screen

## Testing Your Setup

1. Create a simple test sheet with just 1-2 words
2. Make it public
3. Try syncing just that sheet
4. Once it works, add your full vocabulary

## Example Working URL

```
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit#gid=0
```

Breaking it down:
- `https://docs.google.com/spreadsheets/d/` - Base URL
- `1AbCdEfGhIjKlMnOpQrStUvWxYz` - Your sheet ID (unique)
- `/edit#gid=0` - Edit mode and sheet GID

## Still Having Issues?

1. **Try the Test Connection button** - This will tell you exactly what's wrong
2. **Check browser console** - Look for specific error messages
3. **Try a different browser** - Sometimes browser extensions block requests
4. **Create a new simple test sheet** - Start fresh with minimal data
5. **Double-check the sheet is PUBLIC** - This is almost always the issue!

## New Features Added

✨ **Test Connection** - Verify sheet access before syncing
✨ **Better Error Messages** - Know exactly what went wrong
✨ **Improved URL Parsing** - More flexible URL formats accepted
✨ **Partial Sync** - If one level fails, others still sync
✨ **Visual Feedback** - Clear status messages and alerts

## Quick Checklist

Before clicking "Sync Data":

- [ ] Sheet is set to "Anyone with the link can view"
- [ ] Using full URL from browser address bar
- [ ] Sheet has correct column names (Lesson, Japanese, English)
- [ ] All 5 sub-sheets exist (N5, N4, N3, N2, N1)
- [ ] Test Connection button shows success
- [ ] Internet connection is working

## Success!

Once everything is configured correctly, you should see:
- ✅ Green success message on Test Connection
- ✅ Sync dialog showing progress for each level
- ✅ "Added X words to [Level]" confirmation
- ✅ Vocabulary appears in the main screen

Now you can start studying! 🎉
