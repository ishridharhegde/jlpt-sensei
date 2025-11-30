import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Stack,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { getCategoriesForLevel } from '../services/srsService';

const CategorySelectionScreen = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadCategories();
  }, [level]);
  
  const loadCategories = async () => {
    try {
      setLoading(true);
      const cats = await getCategoriesForLevel(level);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleCategory = (categoryName) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };
  
  const handleStartReview = () => {
    navigate(`/vocabulary/${level}/review`, {
      state: { categories: selectedCategories }
    });
  };
  
  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ backgroundColor: '#ffffff' }}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/vocabulary')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {level} Categories
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="sm" sx={{ pb: 10, pt: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select categories to study
        </Typography>
        
        <Stack spacing={2}>
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              selected={selectedCategories.includes(category.name)}
              onToggle={() => handleToggleCategory(category.name)}
            />
          ))}
        </Stack>
        
        {categories.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No categories found for {level}
            </Typography>
          </Box>
        )}
      </Container>
      
      {selectedCategories.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 56, // Above bottom nav
            left: 0,
            right: 0,
            p: 2,
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 999,
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleStartReview}
            sx={{ minHeight: 56 }}
          >
            Start Review ({selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'})
          </Button>
        </Box>
      )}
    </>
  );
};

export default CategorySelectionScreen;
