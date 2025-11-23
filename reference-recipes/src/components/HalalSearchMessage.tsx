import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface HalalSearchMessageProps {
  message: string;
  onClose?: () => void;
}

const HalalSearchMessage: React.FC<HalalSearchMessageProps> = ({ message, onClose }) => {
  return (
    <Alert 
      severity="warning" 
      onClose={onClose}
      sx={{ 
        marginBottom: 2, 
        width: '100%', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '& .MuiAlert-icon': {
          color: '#ff9800'
        }
      }}
    >
      <AlertTitle>Search Not Permitted</AlertTitle>
      {message}
    </Alert>
  );
};

export default HalalSearchMessage;
