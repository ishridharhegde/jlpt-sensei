import { Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { getAnimationsEnabled } from '../services/configService';

const RatingButtons = ({ onRate, disabled }) => {
  // Get animation setting directly (no state needed since component remounts on each flip)
  const animationsEnabled = getAnimationsEnabled();
  
  const buttons = [
    { label: 'Again', quality: 1, color: '#f44336' },
    { label: 'Hard', quality: 3, color: '#ff9800' },
    { label: 'Good', quality: 4, color: '#4caf50' },
    { label: 'Easy', quality: 5, color: '#2196f3' }
  ];
  
  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
        justifyContent: 'center',
        flexWrap: 'wrap',
        mt: { xs: 2, sm: 3, md: 4 },
        width: '100%',
        maxWidth: { xs: '100%', sm: '600px', md: '800px', lg: '1000px' },
        mx: 'auto'
      }}
    >
      {buttons.map((button, index) => (
        <Box
          key={button.quality}
          component={motion.div}
          initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animationsEnabled ? { delay: index * 0.1 } : { duration: 0 }}
          sx={{ 
            flex: { xs: '1 1 45%', sm: '1 1 22%', md: '1 1 20%' },
            minWidth: { xs: '140px', sm: '160px', md: '180px', lg: '200px' },
            maxWidth: { xs: '200px', sm: '220px', md: '250px', lg: '280px' }
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => onRate(button.quality)}
            disabled={disabled}
            sx={{
              backgroundColor: button.color,
              minHeight: { xs: 56, sm: 64, md: 72, lg: 80 },
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem', lg: '1.3rem' },
              fontWeight: 600,
              py: { xs: 1.5, sm: 2, md: 2.5 },
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: button.color,
                filter: 'brightness(1.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground'
              }
            }}
          >
            {button.label}
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default RatingButtons;
