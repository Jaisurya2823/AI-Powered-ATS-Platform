import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnack((p) => ({ ...p, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        <Alert onClose={handleClose} severity={snack.severity} variant="filled" sx={{ minWidth: 280 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used inside SnackbarProvider');
  return ctx;
};