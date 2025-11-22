import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const LEVEL_COLORS = {
  N5: '#4caf50',
  N4: '#2196f3',
  N3: '#ff9800',
  N2: '#f44336',
  N1: '#9c27b0'
};

const LEVEL_GRADIENTS = {
  N5: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
  N4: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
  N3: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
  N2: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
  N1: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
};

// Default gradient for non-JLPT levels
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #607d8b 0%, #90a4ae 100%)';

const LevelCard = ({ level, stats, onClick }) => {
  // Use predefined gradient for JLPT levels, default for others
  const gradient = LEVEL_GRADIENTS[level] || DEFAULT_GRADIENT;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          background: gradient,
          color: 'white',
          minHeight: { xs: 160, sm: 180, md: 200 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none'
          }
        }}
        elevation={0}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2.5rem', sm: '3rem' },
                letterSpacing: '-0.02em'
              }}
            >
              {level}
            </Typography>
            {stats && stats.due > 0 && (
              <Chip 
                label={`${stats.due} due`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              />
            )}
          </Box>
          
          {stats ? (
            <Box sx={{ opacity: 0.95 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  fontWeight: 500,
                  mb: 0.5
                }}
              >
                Total: {stats.total} words
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  fontWeight: 500
                }}
              >
                New: {stats.new} | Reviewed: {stats.reviewed}
              </Typography>
            </Box>
          ) : (
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.95,
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                fontWeight: 500
              }}
            >
              Tap to start learning
            </Typography>
          )}
        </CardContent>
        
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)',
            filter: 'blur(20px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
            filter: 'blur(15px)'
          }}
        />
      </Card>
    </motion.div>
  );
};

export default LevelCard;
