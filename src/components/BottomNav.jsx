import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Book, MenuBook, Settings } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/vocabulary')) return 0;
    if (path.startsWith('/reading')) return 1;
    if (path.startsWith('/settings')) return 2;
    return 0;
  };
  
  const handleChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate('/vocabulary');
        break;
      case 1:
        navigate('/reading');
        break;
      case 2:
        navigate('/settings');
        break;
      default:
        break;
    }
  };
  
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getActiveTab()}
        onChange={handleChange}
        showLabels
        sx={{
          height: { xs: 64, sm: 70 },
          backgroundColor: '#ffffff',
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(0, 0, 0, 0.5)',
            minWidth: { xs: 70, sm: 80 },
            padding: { xs: '8px 12px', sm: '8px 16px' },
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.05)'
            },
            '&.Mui-selected': {
              color: '#667eea',
              fontWeight: 600,
              '& .MuiBottomNavigationAction-label': {
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 600
              },
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.1)'
              }
            }
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            marginTop: '4px',
            opacity: 1
          },
          '& .MuiSvgIcon-root': {
            fontSize: { xs: '1.5rem', sm: '1.6rem' },
            transition: 'transform 0.2s ease'
          }
        }}
      >
        <BottomNavigationAction label="Vocabulary" icon={<Book />} />
        <BottomNavigationAction label="Reading" icon={<MenuBook />} />
        <BottomNavigationAction label="Settings" icon={<Settings />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
