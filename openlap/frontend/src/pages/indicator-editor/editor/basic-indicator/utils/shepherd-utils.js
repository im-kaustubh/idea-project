/**
 * Utility functions for Shepherd.js tour step validation and configuration
 */

// Main step validation function - allows free progression
export const validateStepCompletion = (stepIndex, { indicatorQuery, analysisRef, visRef, indicator }) => {
  // Allow progression on all steps - user can advance freely
  return true;
};

// Get the next available step based on current context
export const getNextAvailableStep = ({ indicatorQuery, analysisRef, visRef, indicator, lockedStep }) => {
  // For now, always start from step 0
  // This can be enhanced to determine the appropriate starting step based on current state
  return 0;
};

// Check if a specific step is available based on current state
export const isStepAvailable = (stepId, context) => {
  // All steps are available by default
  return true;
};

// Get step configuration based on current state
export const getStepConfig = (stepId, context) => {
  // Return default configuration for all steps
  return {
    enabled: true,
    visible: true
  };
};

// --- Walkthrough helpers to ensure elements are visible and parent accordions are open ---

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Open a section Accordion by its data-step marker if it is collapsed
export const openAccordionByDataStep = async (dataStep) => {
  if (!dataStep) return;
  const container = document.querySelector(`[data-step="${dataStep}"]`);
  if (!container) return;
  const summary = container.querySelector('.MuiAccordionSummary-root');
  if (!summary) return;
  const isExpanded =
    container.classList.contains('Mui-expanded') ||
    summary.classList.contains('Mui-expanded') ||
    summary.getAttribute('aria-expanded') === 'true' ||
    container.getAttribute('aria-expanded') === 'true';
  if (!isExpanded) {
    summary.click();
    await delay(150);
  }
  // Ensure it is in view
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await delay(100);
};

// Ensure a specific target exists and is visible; optionally open an accordion first
export const ensureTargetVisible = async (selector, dataStepToOpen) => {
  if (dataStepToOpen) {
    await openAccordionByDataStep(dataStepToOpen);
  }
  // Retry to wait for target mounting/layout
  for (let i = 0; i < 15; i += 1) {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await delay(50);
      return;
    }
    await delay(100);
  }
};
