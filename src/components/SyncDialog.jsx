import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

const SyncDialog = ({ open, onClose, syncState, results }) => {
  const { isLoading, currentLevel, error } = syncState;
  
  return (
    <Dialog 
      open={open} 
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isLoading ? 'Syncing Data...' : error ? 'Sync Error' : 'Sync Complete'}
      </DialogTitle>
      
      <DialogContent>
        {isLoading && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Syncing {currentLevel}...
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" icon={<Error />}>
            {error}
          </Alert>
        )}
        
        {!isLoading && !error && results && (
          <Box>
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
              Successfully synced vocabulary data!
            </Alert>
            
            {Object.entries(results).map(([level, result]) => (
              <Box key={level} sx={{ mb: 1 }}>
                <Typography variant="body1">
                  <strong>{level}:</strong> Added {result.added} word{result.added !== 1 ? 's' : ''}
                </Typography>
              </Box>
            ))}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Total: {Object.values(results).reduce((sum, r) => sum + r.added, 0)} words added
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isLoading}
          variant="contained"
        >
          {isLoading ? 'Syncing...' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyncDialog;
