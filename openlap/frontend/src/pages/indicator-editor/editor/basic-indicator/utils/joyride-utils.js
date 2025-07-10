/**
+ * Utility functions for Joyride tour step validation and configuration
+ */

// Step validation functions
export const isLrsSelected = (indicatorQuery) => {
  return indicatorQuery.lrsStores.length > 0;
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
    case 2: // Activity Type Selection
      return isActivityTypeSelected(indicatorQuery);
    case 3: // Activity Selection
      return isActivitySelected(indicatorQuery);
    case 4: // Action Selection
      return isActionSelected(indicatorQuery);
    case 5: // Date Range
      return isDateRangeValid(indicatorQuery);
    case 6: // Analysis Technique
      return isAnalysisTechniqueSelected(analysisRef);
    case 7: // Analysis Inputs
      return isAnalysisInputsMapped(analysisRef);
    case 8: // Analysis Parameters
      return isAnalysisParamsSet(analysisRef);
    case 9: // Preview Analysis Data
      return isAnalysisDataGenerated(analysisRef);
    case 10: // Visualization Library
      return isVisualizationLibrarySelected(visRef);
    case 11: // Visualization Type
      return isVisualizationTypeSelected(visRef);
    case 12: // Visualization Inputs
      return isVisualizationInputsMapped(visRef);
    case 13: // Generate Preview
      return isPreviewGenerated(indicator);
    case 14: // Final Submit
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
export const getNextAvailableStep = ({ indicatorQuery, analysisRef, visRef, indicator }) => {
  const maxSteps = 15;
  for (let i = 0; i < maxSteps; i++) {
    if (!validateStepCompletion(i, { indicatorQuery, analysisRef, visRef, indicator })) {
      return i;
    }
  }
  return maxSteps - 1; // Return final step if all completed
};

// Generate tooltip content for locked steps
export const getStepTooltipContent = (stepIndex) => {
  const tooltips = {
    1: "Please select at least one Learning Record Store (LRS) first",
    2: "Please select at least one Platform first",
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
  };
  return tooltips[stepIndex] || "Please complete the previous steps first";
};