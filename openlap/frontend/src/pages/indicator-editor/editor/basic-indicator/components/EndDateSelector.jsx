import React from 'react';
import { TextField, Box, Typography } from '@mui/material';

const EndDateSelector = ({ endDate, setEndDate }) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant='subtitle1' gutterBottom>End Date</Typography>
      <TextField
        type='date'
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
        inputProps={{ max: today }}
      />
    </Box>
  );
};

export default EndDateSelector; 