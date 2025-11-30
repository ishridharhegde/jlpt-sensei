import { 
  Container,
  Box,
  LinearProgress,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { ArrowBack, Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import FlashCard from '../components/FlashCard';
import RatingButtons from '../components/RatingButtons';
import { getReviewSession, updateSRSProgress } from '../services/srsService';

const SRSReviewScreen = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const categories = location.state?.categories || [];
  
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [stats, setStats] = useState({ total: 0, due: 0, new: 0 });
  
  useEffect(() => {
    loadReviewSession();
  }, []);
  
  const loadReviewSession = async () => {
    try {
      setLoading(true);
      const session = await getReviewSession(level, categories);
      setCards(session.cards);
      setStats(session.stats);
      
      if (session.cards.length === 0) {
        setShowComplete(true);
      }
    } catch (error) {
      console.error('Error loading review session:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFlip = () => {
    setIsFlipped(true);
  };
  
  const handleRate = async (quality) => {
    const currentCard = cards[currentIndex];
    
    try {
      // Update SRS progress
      await updateSRSProgress(currentCard.id, level, categories, quality);
      
      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        // Review complete
        setShowComplete(true);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  
  const handleClose = () => {
    navigate(`/vocabulary/${level}`);
  };
  
  const handleCompleteClose = () => {
    navigate('/vocabulary');
  };
  
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ pt: 10 }}>
        <LinearProgress />
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          Loading review session...
        </Typography>
      </Container>
    );
  }
  
  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  
  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <IconButton 
            edge="start" 
            onClick={handleClose} 
            sx={{ 
              mr: 2,
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <Close />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              {level} Review
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {currentIndex + 1} / {cards.length}
            </Typography>
          </Box>
        </Toolbar>
        <LinearProgress 
          variant="determinate" 
          value={progress}
          sx={{
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        />
      </AppBar>
      
      <Container 
        maxWidth="sm" 
        sx={{ 
          pt: { xs: 2, sm: 2, md: 3 },
          pb: { xs: 10, sm: 10, md: 10 },
          px: { xs: 2, sm: 3 },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)'
        }}
      >
        {currentCard && (
          <>
            <FlashCard word={currentCard} onFlip={handleFlip} />
            
            {isFlipped && (
              <RatingButtons onRate={handleRate} />
            )}
          </>
        )}
      </Container>
      
      {/* Completion Dialog */}
      <Dialog 
        open={showComplete}
        onClose={handleCompleteClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          🎉 Review Complete!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Great job! You've completed this review session.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Cards reviewed: {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Due cards: {stats.due}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New cards: {stats.new}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompleteClose} variant="contained">
            Back to Vocabulary
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SRSReviewScreen;
