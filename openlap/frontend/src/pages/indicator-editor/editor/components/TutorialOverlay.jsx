import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  MobileStepper
} from '@mui/material';

const steps = [
  'Click on “Create a Basic Indicator” to begin defining a new indicator.',
  'Use “Composite Indicator” when you want to combine multiple existing indicators with a shared method.',
  'Use “Multi-level Analysis” when indicators share a common data column.'
];

const TutorialOverlay = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Welcome to the Indicator Editor</DialogTitle>
      <DialogContent>
        <Typography>{steps[activeStep]}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button onClick={() => setActiveStep((s) => Math.max(0, s - 1))} disabled={activeStep === 0}>Back</Button>
        <Button onClick={() => setActiveStep((s) => s + 1)} disabled={activeStep === steps.length - 1}>
          {activeStep === steps.length - 1 ? 'Done' : 'Next'}
        </Button>
      </DialogActions>
      <MobileStepper
        variant='dots'
        steps={steps.length}
        position='static'
        activeStep={activeStep}
        sx={{ justifyContent: 'center', mb: 1 }}
        nextButton={null}
        backButton={null}
      />
    </Dialog>
  );
};

export default TutorialOverlay; 