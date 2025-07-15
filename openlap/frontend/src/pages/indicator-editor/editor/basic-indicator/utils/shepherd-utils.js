/**
 * Utility functions for Shepherd.js tour step validation and configuration
 */

// Main step validation function - allows free progression
export const validateStepCompletion = (stepIndex, { indicatorQuery, analysisRef, visRef, indicator }) => {
  // Allow progression on all steps - user can advance freely
  return true;
};



// Get next available step - always start from beginning
export const getNextAvailableStep = ({ indicatorQuery, analysisRef, visRef, indicator, lockedStep }) => {
  return 0; // Always start from step 0
};
