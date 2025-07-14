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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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
              const tour = this.tour;
              return validateAndNavigate(tour, 'next');
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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
          <p>Select the <strong>Actions</strong> performed on these activities.</p>
          <p>Actions like "viewed", "completed", "attempted" define what learner behaviors you want to track.</p>
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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

    // Step 6: Date Range Selection
    {
      title: 'Set Date Range',
      text: `
        <div>
          <p>Configure the <strong>time period</strong> for your analysis.</p>
          <p>Choose the start and end dates to define when the learning activities occurred.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-date-range',
        on: 'top'
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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

    // Step 7: Analysis Technique Selection
    {
      title: 'Choose Analysis Method',
      text: `
        <div>
          <p>Select an <strong>Analytics Technique</strong> to process your data.</p>
          <p>Different techniques like frequency analysis, correlation, or clustering provide different insights into learning patterns.</p>
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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

    // Step 8: Analysis Inputs Mapping
    {
      title: 'Map Analysis Inputs',
      text: `
        <div>
          <p>Map your data fields to the <strong>analysis inputs</strong>.</p>
          <p>This tells the analytics technique which parts of your data to use for processing.</p>
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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
      title: 'Set Parameters',
      text: `
        <div>
          <p>Configure the <strong>analysis parameters</strong>.</p>
          <p>These settings fine-tune how the analytics technique processes your data.</p>
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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
      title: 'Preview Analysis',
      text: `
        <div>
          <p>Click <strong>"Preview data"</strong> to run the analysis and see the processed results.</p>
          <p>This will generate the analyzed data that you'll use for visualization.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-preview-data-btn',
        on: 'top'
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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
          <p>Select a <strong>Visualization Library</strong> for creating charts.</p>
          <p>Different libraries offer various chart types and styling options like D3.js, Chart.js, or ApexCharts.</p>
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(11, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'visualization-library'
    },

    // Step 12: Visualization Type
    {
      title: 'Select Chart Type',
      text: `
        <div>
          <p>Choose the <strong>Visualization Type</strong> that best represents your data.</p>
          <p>Options include bar charts, line graphs, pie charts, and more specialized learning analytics visualizations.</p>
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(12, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'visualization-type'
    },

    // Step 13: Visualization Inputs
    {
      title: 'Map Visualization Data',
      text: `
        <div>
          <p>Map your analyzed data to the <strong>visualization inputs</strong>.</p>
          <p>This determines what data appears on the X-axis, Y-axis, and other chart elements.</p>
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
          }
        }
      ],
      when: {
        show: function() {
          return shouldShowStep(13, { indicatorQuery, analysisRef, visRef, indicator, lockedStep });
        }
      },
      id: 'visualization-inputs'
    },

    // Step 14: Generate Preview
    {
      title: 'Generate Preview',
      text: `
        <div>
          <p>Click <strong>"Generate Preview"</strong> to create your visualization.</p>
          <p>This will process your data and display the final chart that represents your learning analytics indicator.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-generate-preview-btn',
        on: 'top'
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
            const tour = this.tour;
            return validateAndNavigate(tour, 'next');
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
          <p>Perfect! Your indicator is ready. Click <strong>"Save Indicator"</strong> to save it to your collection.</p>
          <p>You can customize the chart appearance in the panel to the right before saving.</p>
          <p>🎉 Congratulations on creating your learning analytics indicator!</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-submit-btn',
        on: 'top'
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

  // Filter steps based on their when conditions
  return steps.filter(step => !step.when || step.when.show());
};

// Shepherd.js specific styles configuration
export const shepherdStyles = {
  defaultStepOptions: {
    classes: 'shepherd-theme-custom',
    scrollTo: true,
    showCancelLink: true,
    cancelIcon: {
      enabled: true,
    },
    modalOverlayOpeningPadding: 4,
    modalOverlayOpeningRadius: 8,
    useModalOverlay: true,
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