import { validateStepCompletion, canProceedToStep, shouldShowStep } from './shepherd-utils.js';

/**
 * Tour steps configuration for the Basic Indicator Editor using Shepherd.js
 */
export const createTourSteps = (context, validateAndNavigate) => {
  const { indicatorQuery, analysisRef, visRef, indicator, lockedStep } = context;
  
  const steps = [
    // Step 0: LRS Selection
    {
      title: 'Welcome to the Basic Indicator Editor!',
      text: `
        <div>
          <p>Let's start by selecting a <strong>Learning Record Store (LRS)</strong>. This is where your learning data is stored.</p>
          <p>Choose from the available LRS options to begin building your indicator.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-lrs-selector',
        on: 'right'
      },
      buttons: [
        {
          text: 'Skip Tour',
          classes: 'shepherd-button-skip',
          action: function() {
            return this.cancel();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      id: 'lrs-selection'
    },

    // Step 1: Platform Selection
    {
      title: 'Select Platform',
      text: `
        <div>
          <p>Great! Now choose the <strong>Platform</strong> where your learning activities take place.</p>
          <p>Platforms like Moodle, Canvas, or other learning management systems will appear here based on your LRS selection.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-platform-selector',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(1, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'platform-selection'
    },

    // Step 2: Next Button
    {
      title: 'Continue to Activities',
      text: `
        <div>
          <p>Click this button to proceed to activity selection after choosing your platform.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-next-btn-dataset',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: async function() {
            // Get reference to your actual button
            const actualButton = document.querySelector('.shepherd-next-btn-dataset');
            
            if (actualButton && !actualButton.disabled) {
              // Trigger the button click
              actualButton.click();
              
              // Wait for the action to complete
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Then proceed to next tour step using validation
              return validateAndNavigate('next');
            }
            return this;
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(2, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'next-button'
    },
    // Step 3: Activity Type Selection
    {
      title: 'Choose Activity Type',
      text: `
        <div>
          <p>Next, select the <strong>Activity Type</strong> you want to analyze.</p>
          <p>This defines the kind of learning activities (like courses, assessments, etc.) that will be included in your indicator.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-activity-type-selector',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(3, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'activity-type-selection'
    },

    // Step 4: Activity Selection
    {
      title: 'Select Activities',
      text: `
        <div>
          <p>Now choose the specific <strong>Activities</strong> you want to analyze.</p>
          <p>These are the individual learning objects or courses within your selected activity type.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-activity-selector',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(4, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'activity-selection'
    },

    // Step 5: Action Selection
    {
      title: 'Choose Actions',
      text: `
        <div>
          <p>Select the <strong>Actions</strong> that learners can perform on the activities.</p>
          <p>This could include actions like viewing, completing, submitting, etc.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-action-selector',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(5, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'action-selection'
    },

    // Step 6: Date Range
    {
      title: 'Set Date Range',
      text: `
        <div>
          <p>Define the <strong>time period</strong> for your analysis.</p>
          <p>Select start and end dates to filter the learning data within this timeframe.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-date-range',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(6, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'date-range-selection'
    },

    // Step 7: Next Button to Analysis

    {
      title: 'Continue to Analysis',
      text: `
        <div>
          <p>Click this button to proceed to analysis techniques after selecting your data filters.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-next-btn-filters',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: async function() {
            // Get reference to your actual button
            const actualButton = document.querySelector('.shepherd-next-btn-filters');
            
            if (actualButton && !actualButton.disabled) {
              // Trigger the button click
              actualButton.click();
              
              // Wait for the action to complete
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Then proceed to next tour step using validation
              return validateAndNavigate('next');
            }
            return this;
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(7, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'next-button-filters'
    },

    //Step 8 Analysis Technique

    {
      title: 'Choose Analysis Technique',
      text: `
        <div>
          <p>Select an <strong>Analysis Technique</strong> to process your data.</p>
          <p>Different techniques will provide different insights into the learning patterns.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-analysis-technique',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(7, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'analysis-technique-selection'
    },

    // Step 8: Analysis Inputs
    {
      title: 'Map Analysis Inputs',
      text: `
        <div>
          <p>Map your data to the <strong>Analysis Inputs</strong>.</p>
          <p>This tells the system which fields from your data to use in the analysis.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-analysis-inputs',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(8, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'analysis-inputs-mapping'
    },

    // Step 9: Analysis Parameters
    {
      title: 'Set Analysis Parameters',
      text: `
        <div>
          <p>Configure any <strong>Parameters</strong> needed for your chosen analysis technique.</p>
          <p>These fine-tune how the analysis will be performed.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-analysis-params',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(9, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'analysis-parameters'
    },

    // Step 10: Preview Analysis Data
    {
      title: 'Preview Analysis Data',
      text: `
        <div>
          <p>Click this button to <strong>Generate and Preview</strong> the analysis results.</p>
          <p>This will process your data and show you a sample of the results.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-preview-data-btn',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(10, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'preview-analysis-data'
    },

    // Step 11: Visualization Library
    {
      title: 'Choose Visualization Library',
      text: `
        <div>
          <p>Select a <strong>Visualization Library</strong> to create charts and graphs.</p>
          <p>Different libraries offer different types of visualizations and styling options.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-viz-library',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(11, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'visualization-library-selection'
    },

    // Step 12: Visualization Type
    {
      title: 'Select Visualization Type',
      text: `
        <div>
          <p>Choose the <strong>Type of Visualization</strong> that best represents your data.</p>
          <p>Options might include bar charts, line graphs, pie charts, etc.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-viz-type',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(12, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'visualization-type-selection'
    },

    // Step 13: Visualization Inputs
    {
      title: 'Map Visualization Inputs',
      text: `
        <div>
          <p>Map your analysis results to the <strong>Visualization Inputs</strong>.</p>
          <p>This determines which data fields will be displayed in your chart.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-viz-inputs',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(13, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'visualization-inputs-mapping'
    },

    // Step 14: Generate Preview
    {
      title: 'Generate Preview',
      text: `
        <div>
          <p>Click this button to <strong>Generate a Preview</strong> of your visualization.</p>
          <p>This will create a sample chart based on your configuration.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-generate-preview-btn',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: function() {
            return validateAndNavigate('next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(14, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'generate-preview'
    },

    // Step 15: Save Indicator
    {
      title: 'Save Your Indicator',
      text: `
        <div>
          <p>Congratulations! You've successfully configured your indicator.</p>
          <p>Click the <strong>Submit</strong> button to save your indicator for future use.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-submit-btn',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: function() {
            return this.back();
          }
        },
        {
          text: 'Finish',
          classes: 'shepherd-button-primary',
          action: function() {
            return this.complete();
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(15, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'save-indicator'
    }
  ];

  return steps;
};

// Shepherd.js specific styles configuration
export const shepherdStyles = {
  defaultStepOptions: {
    classes: 'shepherd-theme-custom',
    scrollTo: { behavior: 'smooth', block: 'center' },
    showCancelLink: true,
    cancelIcon: {
      enabled: true
    }
  }
};

// Target classes mapping for Shepherd.js
export const shepherdTargetClasses = {
  lrsSelector: 'shepherd-lrs-selector',
  platformSelector: 'shepherd-platform-selector',
  nextBtnDataset: 'shepherd-next-btn-dataset',
  activityTypeSelector: 'shepherd-activity-type-selector',
  activitySelector: 'shepherd-activity-selector',
  actionSelector: 'shepherd-action-selector',
  dateRange: 'shepherd-date-range',
  analysisTechnique: 'shepherd-analysis-technique',
  analysisInputs: 'shepherd-analysis-inputs',
  analysisParams: 'shepherd-analysis-params',
  previewDataBtn: 'shepherd-preview-data-btn',
  vizLibrary: 'shepherd-viz-library',
  vizType: 'shepherd-viz-type',
  vizInputs: 'shepherd-viz-inputs',
  generatePreviewBtn: 'shepherd-generate-preview-btn',
  submitBtn: 'shepherd-submit-btn',
};