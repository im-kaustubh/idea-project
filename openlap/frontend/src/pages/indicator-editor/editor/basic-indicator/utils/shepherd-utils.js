/**
 * Utility functions for Shepherd.js tour step validation and configuration
 */

// Step validation functions
export const isLrsSelected = (indicatorQuery) => {
  const result = indicatorQuery.lrsStores.length > 0;
  console.log('LRS validation:', { count: indicatorQuery.lrsStores.length, valid: result });
  return result;
};

export const isPlatformSelected = (indicatorQuery) => {
  return indicatorQuery.platforms.length > 0;
};

export const isActivityTypeSelected = (indicatorQuery) => {
  return indicatorQuery.activityTypes.length > 0;
};

export const isActivitySelected = (indicatorQuery) => {
  return Object.entries(indicatorQuery.activities).length > 0;
};

export const isActionSelected = (indicatorQuery) => {
  return indicatorQuery.actionOnActivities.length > 0;
};

export const isDateRangeValid = (indicatorQuery) => {
  return indicatorQuery.duration.from && indicatorQuery.duration.until;
};

export const isAnalysisTechniqueSelected = (analysisRef) => {
 return analysisRef.analyticsTechniqueId.length > 0;
};

export const isAnalysisInputsMapped = (analysisRef) => {
  return analysisRef.analyticsTechniqueMapping.mapping.length > 0;
};

export const isAnalysisParamsSet = (analysisRef) => {
  return analysisRef.analyticsTechniqueParams.length > 0;
};

export const isAnalysisDataGenerated = (analysisRef) => {
  return Object.entries(analysisRef.analyzedData).length > 0;
};

export const isVisualizationLibrarySelected = (visRef) => {
  return visRef.visualizationLibraryId.length > 0;
};

export const isVisualizationTypeSelected = (visRef) => {
  return visRef.visualizationTypeId.length > 0;
};

export const isVisualizationInputsMapped = (visRef) => {
  return visRef.visualizationMapping.mapping.length > 0;
};

export const isPreviewGenerated = (indicator) => {
  return indicator.previewData.displayCode.length > 0;
};

// Main step validation function
export const validateStepCompletion = (stepIndex, { indicatorQuery, analysisRef, visRef, indicator }) => {
  switch (stepIndex) {
    case 0: // LRS Selection
      return isLrsSelected(indicatorQuery);
    case 1: // Platform Selection
      return isPlatformSelected(indicatorQuery);
    case 2: // Next Button - considered complete when platform is selected
      return isPlatformSelected(indicatorQuery);
    case 3: // Activity Type Selection
      return isActivityTypeSelected(indicatorQuery);
    case 4: // Activity Selection
      return isActivitySelected(indicatorQuery);
    case 5: // Action Selection
      return isActionSelected(indicatorQuery);
    case 6: // Date Range
      return isDateRangeValid(indicatorQuery);
    case 7: // Analysis Technique
      return isAnalysisTechniqueSelected(analysisRef);
    case 8: // Analysis Inputs
      return isAnalysisInputsMapped(analysisRef);
    case 9: // Analysis Parameters
      return isAnalysisParamsSet(analysisRef);
    case 10: // Preview Analysis Data
      return isAnalysisDataGenerated(analysisRef);
    case 11: // Visualization Library
      return isVisualizationLibrarySelected(visRef);
    case 12: // Visualization Type
      return isVisualizationTypeSelected(visRef);
    case 13: // Visualization Inputs
      return isVisualizationInputsMapped(visRef);
    case 14: // Generate Preview
      return isPreviewGenerated(indicator);
    case 15: // Final Submit
      return true; // Always available once preview is generated
    default:
      return false;
  }
};

// Check if user can proceed to next step
export const canProceedToStep = (targetStepIndex, { indicatorQuery, analysisRef, visRef, indicator }) => {
  // Allow proceeding if all previous steps are completed
  for (let i = 0; i < targetStepIndex; i++) {
    if (!validateStepCompletion(i, { indicatorQuery, analysisRef, visRef, indicator })) {
      return false;
    }
  }
  return true;
};

// Get next available step
export const getNextAvailableStep = ({ indicatorQuery, analysisRef, visRef, indicator, lockedStep }) => {
  const maxSteps = 16;
  
  // Find the first step that is either incomplete or not shown
  for (let i = 0; i < maxSteps; i++) {
    const isStepComplete = validateStepCompletion(i, { indicatorQuery, analysisRef, visRef, indicator });
    const shouldShow = shouldShowStep(i, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
    
    // If step is not complete but should be shown, this is our next step
    if (!isStepComplete && shouldShow) {
      return i;
    }
    
    // If step is complete but the next step should be shown, continue
    if (isStepComplete && shouldShow) {
      continue;
    }
    
    // If step should not be shown, skip it
    if (!shouldShow) {
      continue;
    }
  }
  
  return maxSteps - 1; // Return final step if all completed
};

// Generate tooltip content for locked steps
export const getStepTooltipContent = (stepIndex) => {
  const tooltips = {
    0: "Please select at least one Learning Record Store (LRS) first",
    1: "Please select at least one Platform first", 
    2: "Please click the Next button to proceed to Activity selection",
    3: "Please select at least one Activity Type first",
    4: "Please select at least one Activity first",
    5: "Please select at least one Action first",
    6: "Please complete the date range selection first",
    7: "Please select an Analysis Technique first",
    8: "Please map the analysis inputs first",
    9: "Please set the analysis parameters first",
    10: "Please preview the analysis data first",
    11: "Please select a Visualization Library first",
    12: "Please select a Visualization Type first",
    13: "Please map the visualization inputs first",
    14: "Please generate the preview first",
    15: "Please submit the indicator first",
  };
  return tooltips[stepIndex] || "Please complete the previous steps first";
};

// Check if a step should be shown based on conditions
export const shouldShowStep = (stepIndex, { indicatorQuery, analysisRef, visRef, indicator, lockedStep }) => {
  switch (stepIndex) {
    case 0: // LRS Selection - always show
      return true;
    case 1: // Platform Selection - show if LRS is selected
      return validateStepCompletion(0, { indicatorQuery, analysisRef, visRef, indicator });
    case 2: // Next Button - show if platform is selected
      return validateStepCompletion(1, { indicatorQuery, analysisRef, visRef, indicator });
    case 3: // Activity Type Selection - show if platform is selected and filters panel is unlocked
      return validateStepCompletion(1, { indicatorQuery, analysisRef, visRef, indicator }) && 
             !lockedStep.filter.locked && lockedStep.filter.openPanel;
    case 4: // Activity Selection - show if activity type is selected
      return validateStepCompletion(3, { indicatorQuery, analysisRef, visRef, indicator });
    case 5: // Action Selection - show if activity is selected
      return validateStepCompletion(4, { indicatorQuery, analysisRef, visRef, indicator });
    case 6: // Date Range - show if action is selected
      return validateStepCompletion(5, { indicatorQuery, analysisRef, visRef, indicator });
    case 7: // Analysis Technique - show if date range is valid and analysis panel is open
      return validateStepCompletion(6, { indicatorQuery, analysisRef, visRef, indicator }) && 
             !lockedStep.analysis.locked && lockedStep.analysis.openPanel;
    case 8: // Analysis Inputs - show if analysis technique is selected
      return validateStepCompletion(7, { indicatorQuery, analysisRef, visRef, indicator });
    case 9: // Analysis Parameters - show if analysis inputs are mapped
      return validateStepCompletion(8, { indicatorQuery, analysisRef, visRef, indicator });
    case 10: // Preview Analysis Data - show if analysis parameters are set
      return validateStepCompletion(9, { indicatorQuery, analysisRef, visRef, indicator });
    case 11: // Visualization Library - show if analysis data is generated and viz panel is open
      return validateStepCompletion(10, { indicatorQuery, analysisRef, visRef, indicator }) && 
             !lockedStep.visualization.locked && lockedStep.visualization.openPanel;
    case 12: // Visualization Type - show if viz library is selected
      return validateStepCompletion(11, { indicatorQuery, analysisRef, visRef, indicator });
    case 13: // Visualization Inputs - show if viz type is selected
      return validateStepCompletion(12, { indicatorQuery, analysisRef, visRef, indicator });
    case 14: // Generate Preview - show if viz inputs are mapped
      return validateStepCompletion(13, { indicatorQuery, analysisRef, visRef, indicator });
    case 15: // Save Indicator - show if preview is generated and finalize panel is open
      return validateStepCompletion(14, { indicatorQuery, analysisRef, visRef, indicator }) && 
             !lockedStep.finalize.locked && lockedStep.finalize.openPanel;
    default:
      return false;
  }
};
