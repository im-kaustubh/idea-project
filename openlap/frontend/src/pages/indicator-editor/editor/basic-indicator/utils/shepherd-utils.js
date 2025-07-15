/**
 * Utility functions for Shepherd.js tour step validation and configuration
 */

// Main step validation function - allows free progression
export const validateStepCompletion = (stepIndex, { indicatorQuery, analysisRef, visRef, indicator }) => {
  // Allow progression on all steps - user can advance freely
  return true;
};

/**
 * Determine the current step based on user's progress in the app
 * @param {Object} context - Current app context
 * @returns {number} - The step index to start from
 */
export const getCurrentStepFromProgress = ({ indicatorQuery, analysisRef, visRef, indicator, lockedStep }) => {
  // If there's a locked step, respect that
  if (lockedStep !== null && lockedStep !== undefined) {
    return Math.max(0, lockedStep);
  }

  // Check progress based on completed sections
  let currentStep = 0;

  // Step 0-2: Dataset section (LRS, Platform selection)
  if (indicatorQuery && indicatorQuery.lrs && indicatorQuery.platform) {
    currentStep = Math.max(currentStep, 3); // Move to dataset next button step
  }

  // Step 3-7: Filters section (Activity types, activities, actions, date range)
  if (indicatorQuery && indicatorQuery.filters) {
    const filters = indicatorQuery.filters;
    if (filters.activityTypes && filters.activityTypes.length > 0) {
      currentStep = Math.max(currentStep, 4);
    }
    if (filters.activities && filters.activities.length > 0) {
      currentStep = Math.max(currentStep, 5);
    }
    if (filters.actions && filters.actions.length > 0) {
      currentStep = Math.max(currentStep, 6);
    }
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      currentStep = Math.max(currentStep, 8); // Move to filters next button step
    }
  }

  // Step 8-11: Analysis section
  if (analysisRef && analysisRef.analysisTechnique) {
    currentStep = Math.max(currentStep, 9); // Analysis technique selected
    
    if (analysisRef.analysisInputs && Object.keys(analysisRef.analysisInputs).length > 0) {
      currentStep = Math.max(currentStep, 10); // Analysis inputs mapped
    }
    
    if (analysisRef.analysisParams && Object.keys(analysisRef.analysisParams).length > 0) {
      currentStep = Math.max(currentStep, 12); // Analysis params set, move to next button
    }
  }

  // Step 13-16: Visualization section
  if (visRef && visRef.visualizationLibrary) {
    currentStep = Math.max(currentStep, 13); // Viz library selected
    
    if (visRef.visualizationType) {
      currentStep = Math.max(currentStep, 14); // Viz type selected
    }
    
    if (visRef.visualizationInputs && Object.keys(visRef.visualizationInputs).length > 0) {
      currentStep = Math.max(currentStep, 15); // Viz inputs mapped
    }
  }

  return currentStep;
};

/**
 * Get next available step - now calculates based on current progress
 * @param {Object} context - Current app context  
 * @returns {number} - The step index to start from
 */
export const getNextAvailableStep = ({ indicatorQuery, analysisRef, visRef, indicator, lockedStep }) => {
  return getCurrentStepFromProgress({ indicatorQuery, analysisRef, visRef, indicator, lockedStep });
};

/**
 * Progress tour to next step when section buttons are clicked
 * @param {Object} tourRef - Reference to the current tour
 * @param {string} sectionType - Type of section button clicked (dataset, filters, analysis)
 */
export const progressTourOnSectionClick = (tourRef, sectionType) => {
  if (!tourRef.current || !tourRef.current.isActive()) {
    return;
  }

  const currentStep = tourRef.current.getCurrentStep();
  if (!currentStep) return;

  const currentStepIndex = tourRef.current.steps.findIndex(s => s.id === currentStep.id);
  
  // Define which sections should trigger tour progression
  const sectionProgressionMap = {
    'dataset': ['lrs-selector', 'platform-selector', 'dataset-next'], // Steps 0-2
    'filters': ['activity-types', 'activities', 'actions', 'date-range', 'filters-next'], // Steps 3-7
    'analysis': ['analysis-technique', 'analysis-inputs', 'analysis-inputs-dropdown', 'analysis-params', 'preview-data', 'analysis-next'] // Steps 8-11
  };
  
  const relevantSteps = sectionProgressionMap[sectionType];
  if (relevantSteps && relevantSteps.includes(currentStep.id)) {
    // Find the next appropriate step after this section
    let nextStepIndex = currentStepIndex + 1;
    
    // If this is a section ending, jump to the next section's first step
    if (currentStep.id.includes('-next')) {
      const sectionOrder = ['dataset', 'filters', 'analysis', 'visualization'];
      const currentSectionIndex = sectionOrder.indexOf(sectionType);
      if (currentSectionIndex < sectionOrder.length - 1) {
        // Jump to next section's first step
        const nextSection = sectionOrder[currentSectionIndex + 1];
        if (nextSection === 'filters') nextStepIndex = 3;
        else if (nextSection === 'analysis') nextStepIndex = 8;
        else if (nextSection === 'visualization') nextStepIndex = 13;
      }
    }
    
    // Progress the tour
    if (tourRef.current.steps[nextStepIndex]) {
      setTimeout(() => {
        if (tourRef.current && tourRef.current.isActive()) {
          tourRef.current.show(nextStepIndex);
        }
      }, 500); // Small delay to allow UI to update
    }
  }
};
