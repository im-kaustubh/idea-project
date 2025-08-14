import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Divider, Grid, IconButton, Tooltip, Typography, Fab, Box } from "@mui/material";
import { ArrowBack, TourOutlined, RestartAlt } from "@mui/icons-material";

import SelectionPanel from "./selection-panel/selection-panel.jsx";
import dayjs from "dayjs";
import Condition from "./selection-panel/utils/condition.js";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { requestCreateBasicIndicator } from "../components/preview-panel/utils/preview-api.js";
import { AuthContext } from "../../../../setup/auth-context-manager/auth-context-manager.jsx";

// Walkthrough (Shepherd.js)
import Shepherd from "shepherd.js";
import { createTourSteps } from "./utils/tour-steps.jsx";
import { getNextAvailableStep } from "./utils/shepherd-utils.js";
import "./utils/shepherd-styles.css";

// Additional UI Components
import StepHelpDialog from './components/StepHelpDialog';

export const BasicIndicatorContext = createContext({
  indicatorQuery: {},
  lockedStep: {},
  analysisRef: {},
  analysisInputMenu: {},
  visRef: {},
  indicator: {},
  generate: false,
  loading: false,
  chartConfiguration: null,
  setIndicatorQuery: () => {},
  setLockedStep: () => {},
  setAnalysisRef: () => {},
  setAnalysisInputMenu: () => {},
  setVisRef: () => {},
  setIndicator: () => {},
  setGenerate: () => {},
  setLoading: () => {},
  setChartConfiguration: () => {},
  handleSaveNewBasicIndicator: () => {},
  startTour: () => {},
  stopTour: () => {},
  restartTour: () => {}
});

const BasicIndicator = () => {
  const { api } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [generate, setGenerate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chartConfiguration, setChartConfiguration] = useState(null);
  const [indicator, setIndicator] = useState(() => {
    const savedState = sessionStorage.getItem("session");
    return savedState
      ? {
          ...JSON.parse(savedState).indicator,
          previewData: {
            displayCode: [],
            scriptData: "",
          },
        }
      : {
          previewData: {
            displayCode: [],
            scriptData: "",
          },
          indicatorName: "",
          type: "BASIC",
        };
  });

  const [indicatorQuery, setIndicatorQuery] = useState(() => {
    const savedState = sessionStorage.getItem("session");
    return savedState
      ? JSON.parse(savedState).indicatorQuery
      : {
          lrsStores: [],
          platforms: [],
          activityTypes: [],
          activities: {},
          actionOnActivities: [],
          duration: {
            from: dayjs().subtract(1, "year").toISOString(),
            until: dayjs().toISOString(),
          },
          outputs: [],
          userQueryCondition: Condition.only_me,
        };
  });

  const [analysisRef, setAnalysisRef] = useState(() => {
    const savedState = sessionStorage.getItem("session");
    return savedState
      ? JSON.parse(savedState).analysisRef
      : {
          analyticsTechniqueId: "",
          analyticsTechniqueParams: [],
          analyticsTechniqueMapping: {
            mapping: [],
          },
          analyzedData: {},
        };
  });

  const [visRef, setVisRef] = useState(() => {
    const savedState = sessionStorage.getItem("session");
    return savedState
      ? JSON.parse(savedState).visRef
      : {
          visualizationLibraryId: "",
          visualizationTypeId: "",
          visualizationParams: {
            height: 500,
            width: 500,
          },
          visualizationMapping: {
            mapping: [],
          },
        };
  });

  const [analysisInputMenu, setAnalysisInputMenu] = useState(() => {
    const savedState = sessionStorage.getItem("session");
    return savedState
      ? JSON.parse(savedState).analysisInputMenu
      : {
          activities: {
            id: undefined,
            type: "Text",
            required: true,
            title: "Activities",
            description:
              "Selected list of all the Activities specified in Activity Filter. " +
              'E.g. courses that are selected in Activity name section are "Learning Analytics", "Data Mining" etc.',
            options: [],
          },
          activityTypes: {
            id: "statement.object.definition.type",
            type: "Text",
            required: true,
            title: "Activity Types",
            description: "Types of activities",
          },
          actionOnActivities: {
            id: undefined,
            type: "Text",
            required: true,
            title: "Actions",
            description:
              "Selected list of actions performed on the activity(ies). E.g. a list of actions that were " +
              'performed on a course such as "viewed", "enrolled" etc.',
            options: [],
          },
          platforms: {
            id: "statement.context.platform",
            type: "Text",
            required: true,
            title: "Platforms",
            description:
              'Selected list of sources specified in Dataset such as "Moodle" etc.',
          },
          // user: {
          //   id: "statement.actor.account.name",
          //   type: "Text",
          //   required: true,
          //   title: "Users",
          //   description:
          //     "Selected list of the User(s) specified in User Filter",
          // },
        };
  });

  const [lockedStep, setLockedStep] = useState(() => {
    const savedState = sessionStorage.getItem("session");
    return savedState
      ? JSON.parse(savedState).lockedStep
      : {
          filter: {
            locked: true,
            openPanel: false,
          },
          analysis: {
            locked: true,
            openPanel: false,
          },
          visualization: {
            locked: true,
            openPanel: false,
          },
          finalize: {
            locked: true,
            openPanel: false,
          },
        };
  });



  const prevDependencies = useRef({
    indicatorQuery,
    analysisRef,
    visRef,
    analysisInputMenu,
    lockedStep,
    indicator,
  });

 // Shepherd.js tour state
  const [tourState, setTourState] = useState({
    isActive: false,
    currentStep: 0,
    tour: null,
  });
  const tourRef = useRef(null);

   // Shepherd.js tour navigation - allows free progression
  const validateAndNavigate = (direction = 'next') => {
    if (!tourRef.current) {
      return false;
    }

    const tour = tourRef.current;
    const currentStep = tour.getCurrentStep();

    if (!currentStep) {
      return false;
    }

    const currentStepIndex = tour.steps.findIndex(s => s.id === currentStep.id);
    
    if (direction === 'next') {
      // Proceed to next step without validation
      const nextStepIndex = currentStepIndex + 1;
      if (tour.steps[nextStepIndex]) {
        tour.show(nextStepIndex);
        return true;
      }
    }
    
    return true;
  };

  // Note: Tour validation now happens only when Next button is clicked
  // This prevents tour recreation and state loss during user interactions

 //initialize and update Walkthrough Tour when context changes
  useEffect(() => {
    // Don't recreate tour if it's currently active - this preserves state
    if (tourState.isActive && tourRef.current) {
      return;
    }

    const currentContext = { indicatorQuery, analysisRef, visRef, indicator, lockedStep };
    const steps = createTourSteps(currentContext, validateAndNavigate);
    
    // Clean up existing tour if it's not active
    if (tourRef.current && !tourState.isActive) {
      tourRef.current.complete();
      tourRef.current = null;
    }

    // Create new tour
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      modalOverlayOpeningPadding: 8,
      modalOverlayOpeningRadius: 12,
      defaultStepOptions: {
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        showCancelLink: true,
        cancelIcon: {
          enabled: true,
        },
        when: {
          show: function() {
            // Ensure autocomplete dropdowns are properly highlighted
            setTimeout(() => {
              const stepElement = this.el;
              if (stepElement) {
                const stepId = stepElement.getAttribute('data-shepherd-step-id');
                const autocompleteElements = document.querySelectorAll('.MuiAutocomplete-popper');
                autocompleteElements.forEach(el => {
                  el.style.zIndex = '10001';
                  el.style.position = 'relative';
                });
              }
            }, 100);
          }
        }
      }
    });

    // Add steps to tour
    steps.forEach(step => {
      tour.addStep(step);
    });
    
    // Tour event handlers
    tour.on('complete', () => {
      setTourState(prev => ({
        ...prev,
        isActive: false,
        currentStep: 0
      }));
    });
    
    tour.on('cancel', () => {
      setTourState(prev => ({
        ...prev,
        isActive: false,
        currentStep: 0
      }));
    });
    
    tour.on('show', (event) => {
      setTourState(prev => ({
        ...prev,
        currentStep: event.step ? steps.findIndex(s => s.id === event.step.id) : 0
      }));
    });
    
    tourRef.current = tour;
    
    setTourState(prev => ({
      ...prev,
      tour
    }));
    
  }, [indicatorQuery, analysisRef, visRef, indicator, lockedStep]);



  useEffect(() => {
    const intervalId = setInterval(() => {
      let session = {
        indicatorQuery,
        analysisRef,
        visRef,
        analysisInputMenu,
        indicator,
        lockedStep,
      };

      sessionStorage.setItem("session", JSON.stringify(session));

      // Check if any of the dependencies have changed
      if (
        prevDependencies.current.indicatorQuery !== indicatorQuery ||
        prevDependencies.current.analysisRef !== analysisRef ||
        prevDependencies.current.visRef !== visRef ||
        prevDependencies.current.analysisInputMenu !== analysisInputMenu ||
        prevDependencies.current.lockedStep !== lockedStep ||
        prevDependencies.current.indicator !== indicator
      ) {
        enqueueSnackbar("Autosaved", { variant: "success" });
      }

      // Update the previous dependencies to the current ones
      prevDependencies.current = {
        indicatorQuery,
        analysisRef,
        visRef,
        analysisInputMenu,
        lockedStep,
        indicator,
      };
    }, 4000);

    return () => clearInterval(intervalId);
  }, [
    indicatorQuery,
    analysisRef,
    visRef,
    analysisInputMenu,
    lockedStep,
    indicator,
  ]);



  // Note: Removed handleTourProgress - tour now only advances via Next button

  // Start the tour
  const startTour = () => {
    if (!tourRef.current) return;
    
    const currentContext = { indicatorQuery, analysisRef, visRef, indicator, lockedStep };
    const nextStep = getNextAvailableStep(currentContext);
    
    setTourState(prev => ({
      ...prev,
      isActive: true,
      currentStep: nextStep
    }));
    
    // Always start from the beginning for initial tour, show next step if progressed
    tourRef.current.start();
    
    // If we're not at step 0, show the appropriate step after a delay
    if (nextStep > 0) {
      setTimeout(() => {
        if (tourRef.current) {
          tourRef.current.show(nextStep);
        }
      }, 500);
    }
  };

  // Restart the tour from beginning
    const restartTour = () => {
    if (!tourRef.current) return;
    
    setTourState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0
    }));
    
    tourRef.current.start();
  };

  // Stop the tour
  const stopTour = () => {
    if (!tourRef.current) return;
    
    setTourState(prev => ({
      ...prev,
      isActive: false
    }));
    
    tourRef.current.complete();
  };

  const handleSaveNewBasicIndicator = () => {
    const loadCreateBasicIndicator = async (
      api,
      indicatorQuery,
      analysisRef,
      visRef,
      indicator
    ) => {
      try {
        return await requestCreateBasicIndicator(
          api,
          indicatorQuery,
          analysisRef,
          visRef,
          indicator
        );
      } catch (error) {
        console.log("Error analyzing the data");
      }
    };

    loadCreateBasicIndicator(
      api,
      indicatorQuery,
      analysisRef,
      visRef,
      indicator
    ).then((response) => {
      enqueueSnackbar(response.message, {
        variant: "success",
      });
      navigate("/indicator");
      clearSession();
    });
  };

  const clearSession = () => {
    sessionStorage.removeItem("session");
    sessionStorage.removeItem("dataset");
    sessionStorage.removeItem("filters");
    sessionStorage.removeItem("analysis");
    sessionStorage.removeItem("visualization");
  };

  return (
    <BasicIndicatorContext.Provider
      value={{
        indicatorQuery,
        lockedStep,
        analysisRef,
        analysisInputMenu,
        visRef,
        indicator,
        generate,
        loading,
        chartConfiguration,
        setIndicatorQuery,
        setLockedStep,
        setAnalysisRef,
        setAnalysisInputMenu,
        setVisRef,
        setIndicator,
        setGenerate,
        setLoading,
        setChartConfiguration,
        handleSaveNewBasicIndicator,
                  //Shepherd Functions
          startTour,
          stopTour,
          restartTour
      }}
    >
      {/* Tour Control FABs */}
      <div style={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {!tourState.isActive && (
          <Tooltip title="Start guided tour" placement="left">
            <Fab
              color="primary"
              size="small"
              onClick={startTour}
              sx={{ mb: 1 }}
            >
              <TourOutlined />
            </Fab>
          </Tooltip>
        )}
        
        {tourState.isActive && (
          <Tooltip title="Restart tour from beginning" placement="left">
            <Fab
              color="secondary"
              size="small"
              onClick={restartTour}
            >
              <RestartAlt />
            </Fab>
          </Tooltip>
        )}
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container alignItems="center">
            <Grid item>
              <Grid container alignItems="center">
                <Grid item>
                  <Tooltip
                    arrow
                    title={
                      <Typography variant="body2">
                        Back to Indicator Editor
                      </Typography>
                    }
                  >
                    <IconButton
                      size="small"
                      onClick={() => navigate("/indicator/editor")}
                    >
                      <ArrowBack />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Typography>Back</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs>
              <Typography align="center">Basic Indicator Editor</Typography>
            </Grid>
            <Grid item>
              <Tooltip title="Start guided tour" arrow>
                <IconButton 
                  color="primary" 
                  onClick={startTour}
                  disabled={tourState.isActive}
                >
                  <TourOutlined />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <SelectionPanel />
        </Grid>
      </Grid>
    </BasicIndicatorContext.Provider>
  );
};

export default BasicIndicator;
