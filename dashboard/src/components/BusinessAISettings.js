import React, { useState } from 'react';
import { Box, TextareaAutosize, Button } from '@mui/material';

export default function BusinessAISettings() {
  const [info, setInfo] = useState('');
  
  return (
    <Box sx={{ height: '100%', p: 2 }}>
      <TextareaAutosize
        minRows={20}
        style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        value={info}
        onChange={(e) => setInfo(e.target.value)}
        placeholder="Enter all business information here..."
      />
      <Button variant="contained" onClick={() => console.log('Save clicked:', info)}>
        Save Changes
      </Button>
    </Box>
  );
}