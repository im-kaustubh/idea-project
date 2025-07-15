/**
 * Utility functions for Shepherd.js tour step validation and configuration
 */

// Main step validation function
export const validateStepCompletion = (stepIndex, { indicatorQuery, analysisRef, visRef, indicator }) => {
  switch (stepIndex) {
    case 0: // LRS Selection
      return indicatorQuery.lrsStores.length > 0;
    case 1: // Platform Selection
      return indicatorQuery.platforms.length > 0;
    case 2: // Next Button to Activity Type
      return true;
    case 3: // Activity Type Selection
      return indicatorQuery.activityTypes.length > 0;
    case 4: // Activity Selection
      return Object.entries(indicatorQuery.activities).length > 0;
    case 5: // Action Selection
      return indicatorQuery.actionOnActivities.length > 0;
    case 6: // Date Range
      return true;
    case 7: // Next Button to Analysis
      return true;
    case 8: // Analysis Technique
      return analysisRef.analyticsTechniqueId.length > 0;
    case 9: // Analysis Inputs
      return analysisRef.analyticsTechniqueMapping.mapping.length > 0;
    case 10: // Analysis Parameters
      return analysisRef.analyticsTechniqueParams.length > 0;
    case 11: // Preview Analysis Data
      return Object.entries(analysisRef.analyzedData).length > 0;
    case 12: // Visualization Library
      return visRef.visualizationLibraryId.length > 0;
    case 13: // Visualization Type
      return visRef.visualizationTypeId.length > 0;
    case 14: // Visualization Inputs
      return visRef.visualizationMapping.mapping.length > 0;
    case 15: // Generate Preview
      return indicator.previewData.displayCode.length > 0;
    default:
      return false;
  }
};



// Get next available step
export const getNextAvailableStep = ({ indicatorQuery, analysisRef, visRef, indicator, lockedStep }) => {
  const maxSteps = 16;
  
  for (let i = 0; i < maxSteps; i++) {
    const isStepComplete = validateStepCompletion(i, { indicatorQuery, analysisRef, visRef, indicator });
    const shouldShow = shouldShowStep(i, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
    
    if (!isStepComplete && shouldShow) {
      return i;
    }
  }
  
  return maxSteps - 1;
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
    7: "Please click the Next button to proceed to Analysis",
    8: "Please select an Analysis Technique first",
    9: "Please map the analysis inputs first",
    10: "Please set the analysis parameters first",
    11: "Please preview the analysis data first",
    12: "Please select a Visualization Library first",
    13: "Please select a Visualization Type first",
    14: "Please map the visualization inputs first",
    15: "Please generate the preview first",
  };
  return tooltips[stepIndex] || "Please complete the previous steps first";
};

// Check if a step should be shown based on conditions
export const shouldShowStep = (stepIndex, { indicatorQuery, analysisRef, visRef, indicator, lockedStep }) => {
  switch (stepIndex) {
    case 0: // LRS Selection
      return true;
    case 1: // Platform Selection
      return validateStepCompletion(0, { indicatorQuery, analysisRef, visRef, indicator });
    case 2: // Next Button to Activity Type
      return validateStepCompletion(1, { indicatorQuery, analysisRef, visRef, indicator });
    case 3: // Activity Type Selection
      return validateStepCompletion(1, { indicatorQuery, analysisRef, visRef, indicator }) && 
             !lockedStep.filter.locked && lockedStep.filter.openPanel;
    case 4: // Activity Selection
      return validateStepCompletion(3, { indicatorQuery, analysisRef, visRef, indicator });
    case 5: // Action Selection
      return validateStepCompletion(4, { indicatorQuery, analysisRef, visRef, indicator });
    case 6: // Date Range
      return validateStepCompletion(5, { indicatorQuery, analysisRef, visRef, indicator });
    case 7: // Next Button to Analysis
      return validateStepCompletion(6, { indicatorQuery, analysisRef, visRef, indicator });
    case 8: // Analysis Technique
      return validateStepCompletion(6, { indicatorQuery, analysisRef, visRef, indicator }) && 
             !lockedStep.analysis.locked && lockedStep.analysis.openPanel;
    case 9: // Analysis Inputs
      return validateStepCompletion(8, { indicatorQuery, analysisRef, visRef, indicator });
    case 10: // Analysis Parameters
      return validateStepCompletion(9, { indicatorQuery, analysisRef, visRef, indicator });
    case 11: // Preview Analysis Data
      return validateStepCompletion(10, { indicatorQuery, analysisRef, visRef, indicator });
    case 12: // Visualization Library
      return validateStepCompletion(11, { indicatorQuery, analysisRef, visRef, indicator }) && 
             !lockedStep.visualization.locked && lockedStep.visualization.openPanel;
    case 13: // Visualization Type
      return validateStepCompletion(12, { indicatorQuery, analysisRef, visRef, indicator });
    case 14: // Visualization Inputs
      return validateStepCompletion(13, { indicatorQuery, analysisRef, visRef, indicator });
    case 15: // Generate Preview
      return validateStepCompletion(14, { indicatorQuery, analysisRef, visRef, indicator });
    default:
      return false;
  }
};
