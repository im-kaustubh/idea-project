// No imports needed - tour allows free progression

/**
 * Tour steps configuration for the Basic Indicator Editor using Shepherd.js
 */
export const createTourSteps = (context) => {
  const { indicatorQuery, analysisRef, visRef, indicator, lockedStep } = context;
  
  const steps = [
    // Step 0: LRS Selection
    {
      title: 'Welcome to the Basic Indicator Editor!',
      text: `
        <div>
          <p>Let's start by selecting a <strong>Learning Record Store (LRS)</strong>. This is where your learning data is stored.</p>
          <p>Choose from the available LRS options to begin building your indicator.</p>
          <p><strong>Action:</strong> Click on the LRS dropdown and select <strong>IDEA</strong></p>
          <p><em>After selecting, click "Next" to continue</em></p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-lrs-selector',
        on: 'right'
      },
      when: {
        show: async function() {
          // Ensure the Dataset accordion is open so the target exists
          const mod = await import('./shepherd-utils.js');
          await mod.ensureTargetVisible('.shepherd-lrs-selector', 'dataset');
        }
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
            return this.next();
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
          <p>Platforms like CourseMapper, Moodle or other learning management systems will appear here based on your LRS selection.</p>
          <p><strong>Action:</strong> Click on the Platform dropdown and select <strong>CourseMapper</strong></p>
          <p><em>After selecting, click "Next" to continue</em></p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-platform-selector',
        on: 'right'
      },
      when: {
        show: async function() {
          const mod = await import('./shepherd-utils.js');
          await mod.ensureTargetVisible('.shepherd-platform-selector', 'dataset');
        }
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
            return this.next();
          }
        }
      ],
      id: 'platform-selection'
    },

    // Step 2: Continue to Activities
    {
      title: 'Continue to Activities',
      text: `
        <div>
          <p>Click this button to proceed with <strong>filtering your dataset</strong> after choosing your platform.</p>
          <p><strong>Action:</strong> Click the "NEXT" button to continue to the Filters section</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-next-btn-dataset',
        on: 'right'
      },
      when: {
        show: async function() {
          const mod = await import('./shepherd-utils.js');
          await mod.ensureTargetVisible('.shepherd-next-btn-dataset', 'dataset');
        }
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
            return this.next();
          }
        }
      ],
      id: 'continue-to-activities'
    },

    // Step 3: Activity Type Selection
    {
      title: 'Choose Activity Type',
      text: `
        <div>
          <p>Next, select the <strong>Activity Type</strong> you want to analyze.</p>
          <p>This defines the kind of learning activities (like courses, channels, etc.) that will be included in your indicator.</p>
          <p>Select: <strong>Course</strong> </p>
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
            return this.next();
          }
        }
      ],
      id: 'activity-type-selection'
    },

    // Step 4: Activity Selection
    {
      title: 'Select Activities',
      text: `
        <div>
          <p>Now choose the specific <strong>Activities</strong> you want to analyze.</p>
          <p>These are the individual learning objects within your selected activity type.</p>
          <p>Select available courses by selecting: <strong>course</strong> </p>
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
            return this.next();
          }
        }
      ],
      id: 'activity-selection'
    },

    // Step 5: Action Selection
    {
      title: 'Choose Actions',
      text: `
        <div>
          <p>Select the <strong>Actions</strong> that learners can perform on the activities.</p>
          <p>This could include actions like viewing, completing, submitting, etc.</p>
          <p>Select: <strong>Enrolled</strong> </p>
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
            return this.next();
          }
        }
      ],
      id: 'action-selection'
    },

    // Step 6: Date Range
    {
      title: 'Set Date Range',
      text: `
        <div>
          <p>You can define a <strong>time period</strong> for your analysis.</p>
          <p>For this walkthrough just press:</p>
          <p><strong>Next button</strong> </p>
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
            return this.next();
          }
        }
      ],
      id: 'date-range-selection'
    },

    // Step 7: Next Button to Analysis
    {
      title: 'Continue to Analysis',
      text: `
        <div>
          <p>Click this button to proceed to the <strong>Analysis</strong> step.</p>
          <p>This will unlock the analysis section where you can define your metrics.</p>
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
          action: function() {
            return this.next();
          }
        }
      ],
      id: 'continue-to-analysis'
    },

    // Step 8: Analysis Technique Selection
    {
      title: 'Choose Analysis Method',
      text: `
        <div>
          <p>Select an <strong>Analysis Method</strong> to process your data.</p>
          <p>This defines how your data will be analyzed and what metrics will be calculated.</p>
          <p>Select: <strong>Count keywords in items list</strong></p>
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
            return this.next();
          }
        }
      ],
      id: 'analysis-technique-selection'
    },

    // Step 9: Analysis Inputs Mapping
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
            return this.next();
          }
        }
      ],
      id: 'analysis-inputs-mapping'
    },

    // Step 10: Analysis Parameters
    {
      title: 'Set Analysis Parameters',
      text: `
        <div>
          <p>Configure the <strong>Parameters</strong> for your analysis method.</p>
          <p>These settings control how the analysis will be performed.</p>
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
            return this.next();
          }
        }
      ],
      id: 'analysis-parameters'
    },

    // Step 11: Preview Analysis Data
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
            return this.next();
          }
        }
      ],
      id: 'preview-analysis-data'
    },

    // Step 12: Continue to Visualization
    {
      title: 'Continue to Visualization',
      text: `
        <div>
          <p>Click this button to proceed to the <strong>Visualization</strong> step.</p>
          <p>This will unlock the visualization section where you can choose how to display your results.</p>
        </div>
      `,
      attachTo: {
        element: '.shepherd-next-btn-analysis',
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
            return this.next();
          }
        }
      ],
      id: 'continue-to-visualization'
    },

    // Step 13: Visualization Library Selection
    {
      title: 'Choose Visualization Library',
      text: `
        <div>
          <p>Select a <strong>Visualization Library</strong> to display your results.</p>
          <p>This determines the type of charts and visualizations available.</p>
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
            return this.next();
          }
        }
      ],
      id: 'visualization-library-selection'
    },

    // Step 14: Visualization Type Selection
    {
      title: 'Choose Chart Type',
      text: `
        <div>
          <p>Select a <strong>Chart Type</strong> to visualize your data.</p>
          <p>Choose the best way to represent your analysis results.</p>
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
            return this.next();
          }
        }
      ],
      id: 'visualization-type-selection'
    },

    // Step 15: Visualization Inputs Mapping
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
            return this.next();
          }
        }
      ],
      id: 'visualization-inputs-mapping'
    },

    // Step 16: Generate Preview
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
          text: 'Finish',
          classes: 'shepherd-button-primary',
          action: function() {
            return this.complete();
          }
        }
      ],
      id: 'generate-preview'
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
  nxtBtnAnalysis: 'shepherd-next-btn-analysis',
  vizLibrary: 'shepherd-viz-library',
  vizType: 'shepherd-viz-type',
  vizInputs: 'shepherd-viz-inputs',
  generatePreviewBtn: 'shepherd-generate-preview-btn',
  submitBtn: 'shepherd-submit-btn',
};