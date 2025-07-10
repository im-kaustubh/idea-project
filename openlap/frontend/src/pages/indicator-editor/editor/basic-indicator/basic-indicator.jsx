import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Divider, Grid, IconButton, Tooltip, Typography, Fab } from "@mui/material";
import { ArrowBack, TourOutlined, RestartAlt } from "@mui/icons-material";
import Joyride, { ACTIONS, EVENTS, STATUS, LIFECYCLE } from 'react-joyride';
import SelectionPanel from "./selection-panel/selection-panel.jsx";
import dayjs from "dayjs";
import Condition from "./selection-panel/utils/condition.js";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { requestCreateBasicIndicator } from "../components/preview-panel/utils/preview-api.js";
import { AuthContext } from "../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { createTourSteps, joyrideStyles } from "./utils/tour-steps.jsx";
import { 
  validateStepCompletion, 
  canProceedToStep, 
  getNextAvailableStep, 
  getStepTooltipContent 
} from "./utils/joyride-utils.js";
import "./utils/joyride-styles.css";

export const BasicIndicatorContext = createContext(undefined);

const BasicIndicator = () => {
  const { api } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [generate, setGenerate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chartConfiguration, setChartConfiguration] = useState(null);

  // Joyride state
  const [joyrideState, setJoyrideState] = useState({
    run: false,
    continuous: true,
    loading: false,
    stepIndex: 0,
    steps: [],
  });

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

  // Update Joyride steps when context changes
  useEffect(() => {
    const currentContext = { indicatorQuery, analysisRef, visRef, indicator, lockedStep };
    const steps = createTourSteps(currentContext);
    setJoyrideState(prev => ({
      ...prev,
      steps
    }));
  }, [indicatorQuery, analysisRef, visRef, indicator, lockedStep]);

  // Auto-save functionality
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

  // Joyride callback handler
  const handleJoyrideCallback = (data) => {
  const { action, index, status, type, lifecycle } = data;
  const currentContext = { indicatorQuery, analysisRef, visRef, indicator };

  console.log('Joyride callback:', { action, index, status, type, lifecycle });

  // Handle step completion
  if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
    const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

    // Special case: If user interacts with the target (like selecting LRS)
    if (lifecycle === LIFECYCLE.COMPLETE && action === ACTIONS.NEXT) {
      const isCurrentStepComplete = validateStepCompletion(index, currentContext);
      
      if (isCurrentStepComplete) {
        // Auto-proceed to next step if available
        const nextAvailableStep = getNextAvailableStep(currentContext);
        setJoyrideState(prev => ({
          ...prev,
          stepIndex: nextAvailableStep
        }));
        return;
      }
    }

    // Normal step progression
    if (action === ACTIONS.NEXT) {
      if (!canProceedToStep(nextStepIndex, currentContext)) {
        const tooltipContent = getStepTooltipContent(nextStepIndex);
        enqueueSnackbar(tooltipContent, { 
          variant: "warning",
          autoHideDuration: 4000,
        });
        return;
      }
    }

    setJoyrideState(prev => ({
      ...prev,
      stepIndex: nextStepIndex
    }));
  }
  else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
    setJoyrideState(prev => ({
      ...prev,
      run: false,
      stepIndex: 0
    }));
  }
};

// Add this effect to sync tour with manual Next button clicks
useEffect(() => {
  if (!joyrideState.run) return;

  const currentStep = joyrideState.steps[joyrideState.stepIndex];
  const isNextButtonStep = currentStep?.target === '.joyride-next-btn';

  if (isNextButtonStep && isPlatformSelected(indicatorQuery)) {
    // When user reaches Next button step and has selected platform,
    // but hasn't clicked Next yet, keep showing the Next button step
    return;
  }

  const nextStep = getNextAvailableStep({ indicatorQuery, analysisRef, visRef, indicator });
  if (nextStep !== joyrideState.stepIndex) {
    setJoyrideState(prev => ({ ...prev, stepIndex: nextStep }));
  }
}, [indicatorQuery, joyrideState.run, joyrideState.stepIndex]);

  // Start the tour
  const startTour = () => {
    const currentContext = { indicatorQuery, analysisRef, visRef, indicator };
    const nextStep = getNextAvailableStep(currentContext);
    
    setJoyrideState(prev => ({
      ...prev,
      run: true,
      stepIndex: nextStep
    }));
  };

  // Restart the tour from beginning
  const restartTour = () => {
    setJoyrideState(prev => ({
      ...prev,
      run: true,
      stepIndex: 0
    }));
  };

  // Stop the tour
  const stopTour = () => {
    setJoyrideState(prev => ({
      ...prev,
      run: false
    }));
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
        // Joyride functions
        startTour,
        stopTour,
        restartTour,
      }}
    >
      {/* Joyride Component */}
      <Joyride
        callback={handleJoyrideCallback}
        continuous={joyrideState.continuous}
        run={joyrideState.run}
        scrollToFirstStep={true}
        showProgress={true}
        showSkipButton={true}
        stepIndex={joyrideState.stepIndex}
        steps={joyrideState.steps}
        styles={joyrideStyles}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
        floaterProps={{
          disableAnimation: true,
        }}
      />

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
        {!joyrideState.run && (
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
        
        {joyrideState.run && (
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
                  disabled={joyrideState.run}
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
