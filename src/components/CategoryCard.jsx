import { Card, CardContent, Typography, Checkbox, Box } from '@mui/material';
import { Language, MenuBook } from '@mui/icons-material';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, selected, onToggle }) => {
  const isKanji = category.name === 'KANJI';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={onToggle}
        sx={{
          cursor: 'pointer',
          border: selected ? '2px solid' : '1px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          backgroundColor: selected ? 'action.selected' : 'background.paper',
          transition: 'all 0.2s'
        }}
        elevation={selected ? 4 : 1}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              {isKanji ? (
                <Language color="primary" />
              ) : (
                <MenuBook color="action" />
              )}
              <Box>
                <Typography variant="h6" component="div">
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.count} word{category.count !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
            
            <Checkbox
              checked={selected}
              onChange={onToggle}
              onClick={(e) => e.stopPropagation()}
              sx={{ padding: 0 }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;
