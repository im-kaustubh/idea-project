import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const StepHelpDialog = ({ title, description }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Tooltip title='What is this step for?'>
        <IconButton size='small' onClick={() => setOpen(true)} sx={{ ml: 1 }}>
          <InfoOutlinedIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>{description}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant='outlined'>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StepHelpDialog; 