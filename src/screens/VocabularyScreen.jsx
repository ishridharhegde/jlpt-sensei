import { Container, Grid, Typography, Box, Alert, CircularProgress, AppBar, Toolbar } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LevelCard from '../components/LevelCard';
import { getLevelStats } from '../services/srsService';
import db from '../services/db';

const VocabularyScreen = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [levelStats, setLevelStats] = useState({});
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Check if any vocabulary data exists
      const totalWords = await db.vocabularyWords.count();
      setHasData(totalWords > 0);
      
      if (totalWords > 0) {
        // Get all unique levels from database
        const allWords = await db.vocabularyWords.toArray();
        const uniqueLevels = [...new Set(allWords.map(w => w.level))].sort();
        setLevels(uniqueLevels);
        
        // Load stats for each discovered level
        const stats = {};
        for (const level of uniqueLevels) {
          const levelData = await getLevelStats(level);
          // Only include levels with actual data
          if (levelData.total > 0) {
            stats[level] = levelData;
          }
        }
        setLevelStats(stats);
        // Update levels to only show those with data
        setLevels(Object.keys(stats));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLevelClick = (level) => {
    navigate(`/vocabulary/${level}`);
  };
  
  if (loading) {
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
              Vocabulary Levels
            </Typography>
          </Toolbar>
        </AppBar>
        <Container 
          maxWidth="sm" 
          sx={{ 
            pb: 10, 
            pt: 3, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh'
          }}
        >
          <CircularProgress sx={{ color: '#667eea' }} />
        </Container>
      </>
    );
  }
  
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
            Vocabulary Levels
          </Typography>
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth="sm" 
        sx={{ 
          pb: 10, 
          pt: { xs: 2, sm: 3 },
          minHeight: '100vh'
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: { xs: '0.95rem', sm: '1rem' },
            fontWeight: 500,
            mb: 3
          }}
        >
          {hasData ? 'Select a level to start studying' : 'No data yet'}
        </Typography>
      
      {!hasData && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}
        >
          No vocabulary data found. Please sync data from Settings.
        </Alert>
      )}
      
      {hasData && levels.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Data synced but no levels with vocabulary found. Check your sheet structure.
        </Alert>
      )}
      
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {levels.map((level) => (
          <Grid item xs={12} sm={6} key={level}>
            <LevelCard 
              level={level}
              stats={levelStats[level]}
              onClick={() => handleLevelClick(level)}
            />
          </Grid>
        ))}
      </Grid>
      
      {hasData && levels.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Tap a level to view categories
          </Typography>
        </Box>
      )}
      </Container>
    </>
  );
};

export default VocabularyScreen;
