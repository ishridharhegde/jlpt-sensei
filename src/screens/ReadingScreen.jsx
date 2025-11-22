import { Container, Typography, Box, AppBar, Toolbar } from '@mui/material';
import { MenuBook } from '@mui/icons-material';

const ReadingScreen = () => {
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
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <MenuBook sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Reading practice feature will be available in a future update.
        </Typography>
      </Box>
      </Container>
    </>
  );
};

export default ReadingScreen;
