import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAnimationsEnabled } from '../services/configService';

const FlashCard = ({ word, onFlip }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Load animation preference
  useEffect(() => {
    setAnimationsEnabled(getAnimationsEnabled());
  }, []);
  
  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [word.id]);
  
  const handleClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      onFlip?.();
    }
  };
  
  return (
    <Box
      onClick={handleClick}
      sx={{
        perspective: '1000px',
        width: '100%',
        maxWidth: { xs: '100%', sm: '500px', md: '600px', lg: '700px' },
        mx: 'auto',
        height: { xs: '240px', sm: '280px', md: '320px', lg: '360px' },
        cursor: isFlipped ? 'default' : 'pointer',
        mb: 2
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d'
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={animationsEnabled ? { duration: 0.6, type: 'spring' } : { duration: 0 }}
      >
        {/* Front of card - Japanese */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
          }}
        >
          <CardContent sx={{ textAlign: 'center', width: '100%' }}>
            <Typography 
              variant="h2" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem', xl: '4.5rem' }
              }}
            >
              {word.japanese}
            </Typography>
            {!isFlipped && (
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Tap to reveal
              </Typography>
            )}
          </CardContent>
        </Card>
        
        {/* Back of card - English */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotateY(180deg)',
            backgroundColor: 'white',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent sx={{ textAlign: 'center', width: '100%' }}>
            <Typography 
              variant="h4" 
              component="div"
              color="text.primary"
              sx={{ 
                fontWeight: 'medium',
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.2rem', xl: '2.5rem' }
              }}
            >
              {word.english}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                mt: 2,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', lg: '1.4rem', xl: '1.6rem' }
              }}
            >
              {word.japanese}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default FlashCard;
