import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel,
  AppBar,
  Toolbar
} from '@mui/material';
import { ExpandMore, Delete, Sync, Info, CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { 
  getSheetsUrl, 
  setSheetsUrl,
  getLastSyncTime,
  updateLastSyncTime,
  getAnimationsEnabled,
  setAnimationsEnabled,
  getRandomOrderEnabled,
  setRandomOrderEnabled,
  getUnlimitedReviews,
  setUnlimitedReviews
} from '../services/configService';
import { validateSheetsUrl, syncAllSheets, testSheetAccess, getAllSheets } from '../services/googleSheets';
import db from '../services/db';
import SyncDialog from '../components/SyncDialog';
import { formatRelativeTime } from '../utils/dateUtils';

const SettingsScreen = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [discoveredSheets, setDiscoveredSheets] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [animationsEnabled, setAnimationsEnabledState] = useState(true);
  const [randomOrderEnabled, setRandomOrderEnabledState] = useState(false);
  const [unlimitedReviews, setUnlimitedReviewsState] = useState(false);
  const [syncState, setSyncState] = useState({
    isLoading: false,
    currentLevel: null,
    error: null
  });
  const [syncResults, setSyncResults] = useState(null);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = () => {
    setSheetUrl(getSheetsUrl());
    setLastSync(getLastSyncTime());
    setAnimationsEnabledState(getAnimationsEnabled());
    setRandomOrderEnabledState(getRandomOrderEnabled());
    setUnlimitedReviewsState(getUnlimitedReviews());
  };
  
  const handleToggleAnimations = (event) => {
    const enabled = event.target.checked;
    setAnimationsEnabledState(enabled);
    setAnimationsEnabled(enabled);
  };
  
  const handleToggleRandomOrder = (event) => {
    const enabled = event.target.checked;
    setRandomOrderEnabledState(enabled);
    setRandomOrderEnabled(enabled);
  };
  
  const handleToggleUnlimitedReviews = (event) => {
    const enabled = event.target.checked;
    setUnlimitedReviewsState(enabled);
    setUnlimitedReviews(enabled);
  };
  
  const handleSaveUrl = async () => {
    if (!validateSheetsUrl(sheetUrl)) {
      setTestResult({ success: false, message: 'Invalid Google Sheets URL format. Please use the full URL from your browser.' });
      return;
    }
    setSheetsUrl(sheetUrl);
    
    // Auto-discover sheets
    try {
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/) ||
                    sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)\/edit/);
      if (match) {
        const spreadsheetId = match[1];
        const sheets = await getAllSheets(spreadsheetId);
        setDiscoveredSheets(sheets);
        setTestResult({ 
          success: true, 
          message: `URL saved! Found ${sheets.length} sheet(s): ${sheets.map(s => s.title).join(', ')}` 
        });
      }
    } catch (error) {
      setTestResult({ success: true, message: 'URL saved successfully! Click "Test Connection" to verify access.' });
    }
  };
  
  const handleTestConnection = async () => {
    if (!validateSheetsUrl(sheetUrl)) {
      setTestResult({ success: false, message: 'Please save a valid URL first' });
      return;
    }
    
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      // Test with first discovered sheet or default gid=0
      const gid = discoveredSheets.length > 0 ? discoveredSheets[0].gid : '0';
      const result = await testSheetAccess(sheetUrl, gid);
      setTestResult(result);
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Connection test failed: ${error.message}` 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const handleSyncData = async () => {
    if (!validateSheetsUrl(sheetUrl)) {
      setTestResult({ success: false, message: 'Please save a valid Google Sheets URL first' });
      return;
    }
    
    setShowSyncDialog(true);
    setSyncState({ isLoading: true, currentLevel: null, error: null });
    setSyncResults(null);
    setTestResult(null);
    
    try {
      // Sync all sheets dynamically
      const results = await syncAllSheets(
        sheetUrl,
        (progress) => {
          console.log('Sync progress:', progress);
          setSyncState(prev => ({ ...prev, currentLevel: progress.level }));
        }
      );
      
      // Store in IndexedDB, checking for duplicates
      const finalResults = {};
      
      for (const [sheetTitle, result] of Object.entries(results)) {
        let addedCount = 0;
        
        if (result.words) {
          for (const word of result.words) {
            const existing = await db.vocabularyWords
              .where('[level+lesson+japanese]')
              .equals([word.level, word.lesson, word.japanese])
              .first();
            
            if (!existing) {
              await db.vocabularyWords.add(word);
              addedCount++;
            }
          }
        }
        
        finalResults[sheetTitle] = { added: addedCount };
      }
      
      updateLastSyncTime();
      setLastSync(getLastSyncTime());
      setSyncResults(finalResults);
      setSyncState({ isLoading: false, currentLevel: null, error: null });
    } catch (error) {
      console.error('Sync error:', error);
      setSyncState({ 
        isLoading: false, 
        currentLevel: null, 
        error: error.message || 'An unexpected error occurred during sync'
      });
    }
  };
  
  const handleClearData = async () => {
    try {
      // Clear IndexedDB tables
      await db.vocabularyWords.clear();
      await db.srsProgress.clear();
      
      // Clear localStorage config
      localStorage.removeItem('jlpt_sheets_url');
      localStorage.removeItem('jlpt_last_sync');
      
      // Reset UI state
      setShowDeleteDialog(false);
      setLastSync(null);
      setDiscoveredSheets([]);
      setSheetUrl('');
      setSyncResults(null);
      setTestResult(null);
      
      alert('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data');
    }
  };
  
  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ backgroundColor: '#ffffff' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ pb: 10, pt: 3 }}>
      
      {/* Google Sheets Configuration */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Google Sheets Configuration
        </Typography>
        
        <TextField
          fullWidth
          label="Google Sheets URL"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          sx={{ mb: 2 }}
          helperText="Paste your public Google Sheets URL here"
        />
        
        {testResult && (
          <Alert 
            severity={testResult.success ? 'success' : 'error'} 
            sx={{ mb: 2 }}
            icon={testResult.success ? <CheckCircle /> : undefined}
          >
            {testResult.message}
          </Alert>
        )}
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveUrl}
            sx={{ flex: 1 }}
          >
            Save URL
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={isTestingConnection || !sheetUrl}
            sx={{ flex: 1 }}
            startIcon={isTestingConnection ? <CircularProgress size={20} /> : undefined}
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </Stack>
        
        {discoveredSheets.length > 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Discovered Sheets:
            </Typography>
            {discoveredSheets.map(sheet => (
              <Typography key={sheet.gid} variant="caption" display="block">
                • {sheet.title} (gid: {sheet.gid})
              </Typography>
            ))}
          </Alert>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<Sync />}
          onClick={handleSyncData}
          sx={{ mb: 1 }}
        >
          Sync Data
        </Button>
        
        {lastSync && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Last synced: {formatRelativeTime(lastSync)}
          </Typography>
        )}
      </Paper>
      
      {/* Preferences */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Preferences
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={animationsEnabled}
              onChange={handleToggleAnimations}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body1">Enable Animations</Typography>
              <Typography variant="caption" color="text.secondary">
                Show card flip and button animations during reviews
              </Typography>
            </Box>
          }
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={randomOrderEnabled}
              onChange={handleToggleRandomOrder}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body1">Random Word Order</Typography>
              <Typography variant="caption" color="text.secondary">
                Show vocabulary words in random order instead of sequential
              </Typography>
            </Box>
          }
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={unlimitedReviews}
              onChange={handleToggleUnlimitedReviews}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body1">Unlimited Daily Reviews</Typography>
              <Typography variant="caption" color="text.secondary">
                Review all words in a lesson without daily limits (default: 20 cards/day)
              </Typography>
            </Box>
          }
        />
      </Paper>
      
      {/* Data Management */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom color="error">
          Danger Zone
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          Clearing data will delete all vocabulary and progress. This cannot be undone.
        </Alert>
        
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<Delete />}
          onClick={() => setShowDeleteDialog(true)}
        >
          Clear All Data
        </Button>
      </Paper>
      
      {/* Instructions */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            <Typography>Setup Instructions</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>Step 1:</strong> Create a Google Sheet with any sub-sheet names you want (e.g., N5, N4, Beginner, Advanced, etc.)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 2:</strong> Each sub-sheet should have columns: <strong>Lesson | Japanese | English</strong>
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 3:</strong> For Lesson column, use any names like "KANJI", "Lesson01", "Lesson02", "Verbs", etc.
          </Typography>
          <Typography variant="body2" paragraph sx={{ color: 'error.main', fontWeight: 'bold' }}>
            <strong>Step 4 (CRITICAL):</strong> Make the sheet PUBLIC:
            <br />• Click "Share" button (top right)
            <br />• Click "Change to anyone with the link"
            <br />• Select "Viewer" access
            <br />• Click "Done"
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 5:</strong> Copy the FULL URL from your browser address bar (should contain /spreadsheets/d/)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 6:</strong> Paste URL above and click "Save URL" - the app will auto-discover all sheets!
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 7:</strong> Click "Test Connection" to verify accessibility (optional)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Step 8:</strong> Click "Sync Data" - all sheets will be imported automatically!
          </Typography>
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="caption">
              <strong>✨ Fully Dynamic:</strong> The app automatically discovers all your sheets and their lesson categories. 
              No manual configuration needed! Empty sheets are skipped automatically. 
              Sheet names and lesson names appear exactly as you name them.
            </Typography>
          </Alert>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Common Issues:</strong>
              <br />• 400 Bad Request = Sheet is not public or URL is wrong
              <br />• Network error = Check internet connection
              <br />• Empty data = Check sheet has correct columns (Lesson, Japanese, English)
              <br />• Wrong GID = Make sure N5=0, N4=1, N3=2, N2=3, N1=4 (or find actual GIDs in URL when viewing each sheet)
            </Typography>
          </Alert>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            <strong>Finding GIDs:</strong> When you click on a sub-sheet tab in Google Sheets, look at the URL - it will show "gid=123456". Use those numbers in the GID fields above.
          </Typography>
        </AccordionDetails>
      </Accordion>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Clear All Data?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete all vocabulary words and your study progress. 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleClearData} color="error" variant="contained">
            Clear Data
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sync Dialog */}
      <SyncDialog
        open={showSyncDialog}
        onClose={() => setShowSyncDialog(false)}
        syncState={syncState}
        results={syncResults}
      />
      </Container>
    </>
  );
};

export default SettingsScreen;
