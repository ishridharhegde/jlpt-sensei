import { 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar,
  Button,
  Card,
  CardContent,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  MenuBook, 
  PlayArrow, 
  Stop, 
  Mic, 
  VolumeUp,
  Refresh,
  Settings as SettingsIcon,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { getRandomArticle, markAsRead } from '../services/readingService';
import { toggleFavorite } from '../services/readingCacheService';
import { getShowAllFurigana } from '../services/configService';
import { 
  speakJapanese, 
  startRecording, 
  stopRecording, 
  stopSpeaking,
  isSpeechSynthesisSupported,
  isSpeechRecognitionSupported,
  getJapaneseVoices
} from '../services/speechService';

const ReadingScreen = () => {
  const [level, setLevel] = useState('N5');
  const [contentType, setContentType] = useState('paragraph');
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [showSetup, setShowSetup] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllFurigana, setShowAllFurigana] = useState(false);
  
  useEffect(() => {
    // Check browser support
    setSpeechSupported(isSpeechSynthesisSupported());
    setRecognitionSupported(isSpeechRecognitionSupported());
    
    // Load furigana setting
    setShowAllFurigana(getShowAllFurigana());
    
    // Load voices
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.onvoiceschanged = () => {
        getJapaneseVoices();
      };
    }
    
    // Cleanup: Stop audio and recording when component unmounts
    return () => {
      console.log('[ReadingScreen] Component unmounting - stopping audio and recording');
      stopSpeaking();
      stopRecording();
    };
  }, []);
  
  // Debug: Track isFavorite state changes
  useEffect(() => {
    console.log('[ReadingScreen] isFavorite state changed to:', isFavorite);
  }, [isFavorite]);
  
  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setShowSetup(false);
    
    try {
      const randomArticle = await getRandomArticle(level, contentType, showAllFurigana);
      
      if (!randomArticle) {
        setError('No articles found for this level');
        setShowSetup(true);
        return;
      }
      
      setArticle(randomArticle);
      setIsFavorite(randomArticle.isFavorite || false);
    } catch (err) {
      console.error('Error loading article:', err);
      setError('Failed to load article');
      setShowSetup(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePlayAudio = async () => {
    if (!article) return;
    
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    
    try {
      setIsSpeaking(true);
      await speakJapanese(article.filteredContent);
      setIsSpeaking(false);
    } catch (err) {
      console.error('Speech error:', err);
      setError('Failed to play audio');
      setIsSpeaking(false);
    }
  };
  
  const handleRecord = async () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
      return;
    }
    
    try {
      setIsRecording(true);
      setRecordedText('');
      const text = await startRecording();
      setRecordedText(text);
      setIsRecording(false);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to record. Please check microphone permissions.');
      setIsRecording(false);
    }
  };
  
  const handleNewArticle = async () => {
    // Stop any playing audio before loading new article
    stopSpeaking();
    stopRecording();
    setIsSpeaking(false);
    setIsRecording(false);
    
    // Mark current article as read before loading new one
    if (article && article.id) {
      await markAsRead(article.id);
    }
    
    setArticle(null);
    setRecordedText('');
    setIsFavorite(false);
    handleStart(); // Load new article directly without going back to setup
  };
  
  const handleToggleFavorite = async () => {
    console.log('[ReadingScreen] Toggle favorite clicked', { 
      hasArticle: !!article, 
      articleId: article?.id,
      currentFavoriteStatus: isFavorite 
    });
    
    if (article && article.id) {
      try {
        const newFavoriteStatus = await toggleFavorite(article.id);
        console.log('[ReadingScreen] Favorite toggled successfully', { 
          articleId: article.id, 
          newStatus: newFavoriteStatus,
          willSetStateTo: newFavoriteStatus
        });
        setIsFavorite(newFavoriteStatus);
        console.log('[ReadingScreen] State updated, isFavorite should now be:', newFavoriteStatus);
      } catch (error) {
        console.error('[ReadingScreen] Failed to toggle favorite:', error);
        setError('Failed to update favorite status');
      }
    } else {
      console.warn('[ReadingScreen] Cannot toggle favorite - article or article.id missing');
      setError('This article cannot be favorited (not saved in database)');
    }
  };
  
  if (showSetup && !loading) {
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
              Reading Practice
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="sm" sx={{ pb: 10, pt: 3 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Your Settings
            </Typography>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                JLPT Level
              </Typography>
              <ToggleButtonGroup
                value={level}
                exclusive
                onChange={(e, newLevel) => newLevel && setLevel(newLevel)}
                fullWidth
                sx={{ mt: 1 }}
              >
                <ToggleButton value="N5">N5</ToggleButton>
                <ToggleButton value="N4">N4</ToggleButton>
                <ToggleButton value="N3">N3</ToggleButton>
                <ToggleButton value="N2">N2</ToggleButton>
                <ToggleButton value="N1">N1</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Content Type
              </Typography>
              <ToggleButtonGroup
                value={contentType}
                exclusive
                onChange={(e, newType) => newType && setContentType(newType)}
                fullWidth
                sx={{ mt: 1 }}
              >
                <ToggleButton value="sentence">Sentences</ToggleButton>
                <ToggleButton value="paragraph">Paragraphs</ToggleButton>
                <ToggleButton value="full">Full Article</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAllFurigana}
                    onChange={(e) => setShowAllFurigana(e.target.checked)}
                  />
                }
                label="Show furigana for all kanji (including known ones)"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                When enabled, all kanji will show readings above them, not just ones outside your level
              </Typography>
            </Box>
            
            {!speechSupported && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Text-to-Speech not supported in your browser
              </Alert>
            )}
            
            {!recognitionSupported && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Speech recognition not supported in your browser
              </Alert>
            )}
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleStart}
              startIcon={<PlayArrow />}
              sx={{ mt: 2 }}
            >
              Start Reading
            </Button>
          </Card>
        </Container>
      </>
    );
  }
  
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
              Reading Practice
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="sm" sx={{ pb: 10, pt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
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
            Reading Practice
          </Typography>
          <IconButton onClick={handleNewArticle}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="sm" sx={{ pb: 10, pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {article && (
          <>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={isSpeaking ? <Stop /> : <VolumeUp />}
                onClick={handlePlayAudio}
                disabled={!speechSupported}
                sx={{ minHeight: 56 }}
              >
                {isSpeaking ? 'Stop Audio' : 'Play Audio'}
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={isRecording ? <Stop /> : <Mic />}
                onClick={handleRecord}
                disabled={!recognitionSupported}
                color={isRecording ? 'error' : 'primary'}
                sx={{ minHeight: 56 }}
              >
                {isRecording ? 'Stop Recording' : 'Record Your Reading'}
              </Button>
            </Stack>
            
            <Card sx={{ mb: 3, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                  {article.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label={level} color="primary" size="small" />
                  <IconButton 
                    onClick={handleToggleFavorite}
                    color={isFavorite ? 'error' : 'default'}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
              </Box>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.2rem',
                  lineHeight: 2,
                  letterSpacing: '0.05em',
                  fontFamily: '"Hiragino Sans", "Yu Gothic", sans-serif',
                  '& ruby': {
                    rubyPosition: 'over'
                  },
                  '& rt': {
                    fontSize: '0.5em',
                    color: 'primary.main',
                    fontWeight: 500
                  }
                }}
                dangerouslySetInnerHTML={{ __html: article.filteredContent }}
              />
            </Card>
            
            <Stack spacing={2}>
              {recordedText && (
                <Card sx={{ p: 2, backgroundColor: 'action.hover' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Your Recording:
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontSize: '1.1rem',
                      fontFamily: '"Hiragino Sans", "Yu Gothic", sans-serif'
                    }}
                  >
                    {recordedText}
                  </Typography>
                </Card>
              )}
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleNewArticle}
                startIcon={<Refresh />}
                sx={{ minHeight: 48 }}
              >
                Next Article
              </Button>
              
              <Button
                variant="text"
                fullWidth
                onClick={() => {
                  stopSpeaking();
                  stopRecording();
                  setIsSpeaking(false);
                  setIsRecording(false);
                  setShowSetup(true);
                }}
              >
                Change Settings
              </Button>
            </Stack>
          </>
        )}
      </Container>
    </>
  );
};

export default ReadingScreen;
