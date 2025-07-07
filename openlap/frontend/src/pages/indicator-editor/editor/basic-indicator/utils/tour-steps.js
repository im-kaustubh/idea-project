import { validateStepCompletion, canProceedToStep } from './joyride-utils.js';

/**
 * Tour steps configuration for the Basic Indicator Editor
 */
export const createTourSteps = (context) => {
  const { indicatorQuery, analysisRef, visRef, indicator, lockedStep } = context;
  
  return [
    // Step 0: LRS Selection
    {
      target: '.joyride-lrs-selector',
      content: (
        <div>
          <h3>Welcome to the Basic Indicator Editor!</h3>
          <p>Let's start by selecting a <strong>Learning Record Store (LRS)</strong>. This is where your learning data is stored.</p>
          <p>Choose from the available LRS options to begin building your indicator.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        spotlight: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 1: Platform Selection
    {
      target: '.joyride-platform-selector',
      content: (
        <div>
          <h3>Select Platform</h3>
          <p>Great! Now choose the <strong>Platform</strong> where your learning activities take place.</p>
          <p>Platforms like Moodle, Canvas, or other learning management systems will appear here based on your LRS selection.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(0, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(1, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 2: Activity Type Selection
    {
      target: '.joyride-activity-type-selector',
      content: (
        <div>
          <h3>Choose Activity Type</h3>
          <p>Next, select the <strong>Activity Type</strong> you want to analyze.</p>
          <p>This defines the kind of learning activities (like courses, assessments, etc.) that will be included in your indicator.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(1, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(2, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 3: Activity Selection
    {
      target: '.joyride-activity-selector',
      content: (
        <div>
          <h3>Select Activities</h3>
          <p>Now choose the specific <strong>Activities</strong> you want to analyze.</p>
          <p>These are the individual learning objects or courses within your selected activity type.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(2, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(3, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 4: Action Selection
    {
      target: '.joyride-action-selector',
      content: (
        <div>
          <h3>Choose Actions</h3>
          <p>Select the <strong>Actions</strong> performed on these activities.</p>
          <p>Actions like "viewed", "completed", "attempted" define what learner behaviors you want to track.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(3, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(4, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 5: Date Range Selection
    {
      target: '.joyride-date-range',
      content: (
        <div>
          <h3>Set Date Range</h3>
          <p>Configure the <strong>time period</strong> for your analysis.</p>
          <p>Choose the start and end dates to define when the learning activities occurred.</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(4, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(5, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 6: Analysis Technique Selection
    {
      target: '.joyride-analysis-technique',
      content: (
        <div>
          <h3>Choose Analysis Method</h3>
          <p>Select an <strong>Analytics Technique</strong> to process your data.</p>
          <p>Different techniques like frequency analysis, correlation, or clustering provide different insights into learning patterns.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(5, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !lockedStep.analysis.locked && lockedStep.analysis.openPanel &&
                  !validateStepCompletion(6, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 7: Analysis Inputs Mapping
    {
      target: '.joyride-analysis-inputs',
      content: (
        <div>
          <h3>Map Analysis Inputs</h3>
          <p>Map your data fields to the <strong>analysis inputs</strong>.</p>
          <p>This tells the analytics technique which parts of your data to use for processing.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(6, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(7, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 8: Analysis Parameters
    {
      target: '.joyride-analysis-params',
      content: (
        <div>
          <h3>Set Parameters</h3>
          <p>Configure the <strong>analysis parameters</strong>.</p>
          <p>These settings fine-tune how the analytics technique processes your data.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(7, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(8, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 9: Preview Analysis Data
    {
      target: '.joyride-preview-data-btn',
      content: (
        <div>
          <h3>Preview Analysis</h3>
          <p>Click <strong>"Preview data"</strong> to run the analysis and see the processed results.</p>
          <p>This will generate the analyzed data that you'll use for visualization.</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(8, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(9, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 10: Visualization Library
    {
      target: '.joyride-viz-library',
      content: (
        <div>
          <h3>Choose Visualization Library</h3>
          <p>Select a <strong>Visualization Library</strong> for creating charts.</p>
          <p>Different libraries offer various chart types and styling options like D3.js, Chart.js, or ApexCharts.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(9, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !lockedStep.visualization.locked && lockedStep.visualization.openPanel &&
                  !validateStepCompletion(10, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 11: Visualization Type
    {
      target: '.joyride-viz-type',
      content: (
        <div>
          <h3>Select Chart Type</h3>
          <p>Choose the <strong>Visualization Type</strong> that best represents your data.</p>
          <p>Options include bar charts, line graphs, pie charts, and more specialized learning analytics visualizations.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(10, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(11, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 12: Visualization Inputs
    {
      target: '.joyride-viz-inputs',
      content: (
        <div>
          <h3>Map Visualization Data</h3>
          <p>Map your analyzed data to the <strong>visualization inputs</strong>.</p>
          <p>This determines what data appears on the X-axis, Y-axis, and other chart elements.</p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(11, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(12, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 13: Generate Preview
    {
      target: '.joyride-generate-preview-btn',
      content: (
        <div>
          <h3>Generate Preview</h3>
          <p>Click <strong>"Generate Preview"</strong> to create your visualization.</p>
          <p>This will process your data and display the final chart that represents your learning analytics indicator.</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(12, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !validateStepCompletion(13, { indicatorQuery, analysisRef, visRef, indicator }),
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },

    // Step 14: Save Indicator
    {
      target: '.joyride-submit-btn',
      content: (
        <div>
          <h3>Save Your Indicator</h3>
          <p>Perfect! Your indicator is ready. Click <strong>"Save Indicator"</strong> to save it to your collection.</p>
          <p>You can customize the chart appearance in the panel to the right before saving.</p>
          <p>🎉 Congratulations on creating your learning analytics indicator!</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      spotlightClicks: true,
      when: () => validateStepCompletion(13, { indicatorQuery, analysisRef, visRef, indicator }) && 
                  !lockedStep.finalize.locked && lockedStep.finalize.openPanel,
      styles: {
        options: {
          primaryColor: '#1976d2',
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 16,
        },
      },
    },
  ].filter(step => !step.when || step.when()); // Only include steps that meet their conditions
};

// Custom styles for Joyride highlighting
export const joyrideStyles = {
  options: {
    primaryColor: '#1976d2',
    width: 350,
    zIndex: 1000,
    arrowColor: '#fff',
    backgroundColor: '#fff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    textColor: '#333',
  },
  tooltip: {
    borderRadius: 8,
    fontSize: 16,
    padding: 20,
  },
  tooltipContainer: {
    textAlign: 'left',
  },
  tooltipTitle: {
    fontSize: 18,
    margin: '0 0 10px 0',
  },
  tooltipContent: {
    fontSize: 14,
    lineHeight: 1.5,
  },
  buttonNext: {
    backgroundColor: '#1976d2',
    fontSize: 14,
    padding: '10px 20px',
    borderRadius: 4,
  },
  buttonBack: {
    color: '#1976d2',
    fontSize: 14,
    padding: '10px 20px',
  },
  buttonSkip: {
    color: '#666',
    fontSize: 14,
  },
  spotlight: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

// CSS classes for precise element targeting
export const joyrideTargetClasses = {
  lrsSelector: 'joyride-lrs-selector',
  platformSelector: 'joyride-platform-selector',
  activityTypeSelector: 'joyride-activity-type-selector',
  activitySelector: 'joyride-activity-selector',
  actionSelector: 'joyride-action-selector',
  dateRange: 'joyride-date-range',
  analysisTechnique: 'joyride-analysis-technique',
  analysisInputs: 'joyride-analysis-inputs',
  analysisParams: 'joyride-analysis-params',
  previewDataBtn: 'joyride-preview-data-btn',
  vizLibrary: 'joyride-viz-library',
  vizType: 'joyride-viz-type',
  vizInputs: 'joyride-viz-inputs',
  generatePreviewBtn: 'joyride-generate-preview-btn',
  submitBtn: 'joyride-submit-btn',
};