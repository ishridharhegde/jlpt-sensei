import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Sort, Search, Close, ExpandMore } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { getCategoriesForLevel } from '../services/srsService';
import db from '../services/db';

const CategorySelectionScreen = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchMode, setSearchMode] = useState('partial');
  
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
  
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }
    
    setSearchLoading(true);
    setNoResults(false);
    
    try {
      const lowerQuery = query.toLowerCase();
      
      // Search for chapter by name
      const chapterMatches = categories.filter(cat => 
        cat.name.toLowerCase().includes(lowerQuery)
      );
      
      // Helper function to check if text matches based on search mode
      const textMatches = (text, searchText) => {
        if (searchMode === 'full') {
          // Full match: exact string match
          return text === searchText;
        } else {
          // Partial match: includes the substring
          return text.includes(searchText);
        }
      };
      
      // Search for Japanese words in the database
      const japaneseWordMatches = await db.vocabularyWords
        .where('level')
        .equals(level)
        .toArray()
        .then(words => 
          words.filter(word => textMatches(word.japanese, query))
        );
      
      // Search for English words in the database
      const englishWordMatches = await db.vocabularyWords
        .where('level')
        .equals(level)
        .toArray()
        .then(words => 
          words.filter(word => textMatches(word.english.toLowerCase(), lowerQuery))
        );
      
      // Combine results: chapters directly + chapters containing the word
      const resultMap = new Map();
      
      // Add direct chapter matches
      chapterMatches.forEach(cat => {
        if (!resultMap.has(cat.name)) {
          resultMap.set(cat.name, { ...cat, matchType: 'chapter', wordCount: cat.count });
        }
      });
      
      // Add chapters containing Japanese words
      japaneseWordMatches.forEach(word => {
        const chapter = word.lesson || 'KANJI';
        if (!resultMap.has(chapter)) {
          resultMap.set(chapter, { 
            name: chapter, 
            count: 0,
            matchType: 'word',
            matchedWords: [word]
          });
        } else {
          const existing = resultMap.get(chapter);
          if (!existing.matchedWords) existing.matchedWords = [];
          if (!existing.matchedWords.find(w => w.id === word.id)) {
            existing.matchedWords.push(word);
          }
        }
      });
      
      // Add chapters containing English words
      englishWordMatches.forEach(word => {
        const chapter = word.lesson || 'KANJI';
        if (!resultMap.has(chapter)) {
          resultMap.set(chapter, { 
            name: chapter, 
            count: 0,
            matchType: 'word',
            matchedWords: [word]
          });
        } else {
          const existing = resultMap.get(chapter);
          if (!existing.matchedWords) existing.matchedWords = [];
          if (!existing.matchedWords.find(w => w.id === word.id)) {
            existing.matchedWords.push(word);
          }
        }
      });
      
      const results = Array.from(resultMap.values());
      setSearchResults(results);
      setNoResults(results.length === 0);
    } catch (error) {
      console.error('Search error:', error);
      setNoResults(true);
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleEnterFromSearch = (categoryName) => {
    setSelectedCategories([categoryName]);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    // Trigger review with the searched category
    setTimeout(() => {
      navigate(`/vocabulary/${level}/review`, {
        state: { categories: [categoryName] }
      });
    }, 0);
  };
  
  const handleStartReview = () => {
    navigate(`/vocabulary/${level}/review`, {
      state: { categories: selectedCategories }
    });
  };
  
  const getSortedCategories = () => {
    let sorted = [...categories];
    
    // Sort numerically by chapter number
    sorted.sort((a, b) => {
      // Extract numbers from category names like "Lesson01", "Lesson02", etc.
      const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
      
      // If both are numbers, sort numerically
      if (numA > 0 && numB > 0) {
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
      
      // KANJI stays at top
      if (a.name === 'KANJI') return -1;
      if (b.name === 'KANJI') return 1;
      
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
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
          <IconButton
            onClick={() => setSearchOpen(true)}
            sx={{ color: '#667eea' }}
          >
            <Search />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="sm" sx={{ pb: 10, pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Select categories to study
          </Typography>
          
          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={(e, newOrder) => newOrder && setSortOrder(newOrder)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.75
              }
            }}
          >
            <ToggleButton value="asc" title="Ascending">
              ↑
            </ToggleButton>
            <ToggleButton value="desc" title="Descending">
              ↓
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Stack spacing={2}>
          {getSortedCategories().map((category) => (
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
      
      {/* Search Dialog */}
      <Dialog 
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Search Chapters & Words
          <IconButton
            onClick={() => setSearchOpen(false)}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              autoFocus
              placeholder="Search by chapter name, Japanese or English word..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ToggleButtonGroup
                value={searchMode}
                exclusive
                onChange={(e, newMode) => newMode && setSearchMode(newMode)}
                size="small"
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    fontSize: '0.85rem',
                    py: 1,
                    fontWeight: 500
                  }
                }}
              >
                <ToggleButton value="partial" title="Match substring (ABC will find [AB]C)">
                  Partial
                </ToggleButton>
                <ToggleButton value="full" title="Exact match only">
                  Full
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          
          {searchLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          )}
          
          {!searchLoading && noResults && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No chapters or words found matching "{searchQuery}"
            </Typography>
          )}
          
          {!searchLoading && !noResults && searchResults.length > 0 && (
            <Stack spacing={2}>
              {searchResults.map((result) => (
                <Card 
                  key={result.name}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => handleEnterFromSearch(result.name)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {result.name}
                      </Typography>
                      {result.matchType === 'word' && (
                        <Chip 
                          label="Word match" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {result.count || result.matchedWords?.length || 0} word{(result.count || result.matchedWords?.length || 0) !== 1 ? 's' : ''}
                    </Typography>
                    
                    {result.matchedWords && result.matchedWords.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {result.matchedWords.slice(0, 3).map((word, idx) => (
                          <Chip
                            key={idx}
                            label={`${word.japanese} - ${word.english}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {result.matchedWords.length > 3 && (
                          <Chip
                            label={`+${result.matchedWords.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                    
                    <Typography 
                      variant="caption" 
                      color="primary" 
                      sx={{ mt: 2, display: 'block', fontWeight: 600 }}
                    >
                      Click to study this chapter
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategorySelectionScreen;
