import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import BottomNav from './components/BottomNav';
import VocabularyScreen from './screens/VocabularyScreen';
import CategorySelectionScreen from './screens/CategorySelectionScreen';
import SRSReviewScreen from './screens/SRSReviewScreen';
import ReadingScreen from './screens/ReadingScreen';
import SettingsScreen from './screens/SettingsScreen';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box 
          sx={{ 
            minHeight: '100vh',
            backgroundColor: 'background.default',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/vocabulary" replace />} />
            <Route path="/vocabulary" element={<VocabularyScreen />} />
            <Route path="/vocabulary/:level" element={<CategorySelectionScreen />} />
            <Route path="/vocabulary/:level/review" element={<SRSReviewScreen />} />
            <Route path="/reading" element={<ReadingScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
          <BottomNav />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
