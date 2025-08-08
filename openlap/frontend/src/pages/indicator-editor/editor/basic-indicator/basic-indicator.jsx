import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Divider, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { ArrowBack, TourOutlined } from "@mui/icons-material";

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
import "./utils/shepherd-styles.css";

// Additional UI Components
import EndDateSelector from './components/EndDateSelector';
import StepHelpDialog from './components/StepHelpDialog';

export const BasicIndicatorContext = createContext(undefined);

const BasicIndicator = () => {
  console.log('BasicIndicator component rendering...');
  
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
            width: 800,
            margin: {
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            },
          },
          visualizationMapping: {
            mapping: [],
          },
          visualizationData: {},
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

  // Shepherd.js tour
  const tourRef = useRef(null);
  // Human-note: while the walkthrough is running we keep the editor in a read-only/demo mode
  const [isTourMode, setIsTourMode] = useState(false);
  // Human-note: we store the lock state before starting the tour so we can put it back afterwards
  const originalLockedStepRef = useRef(null);

  // Human-note: create a safe snapshot of the current lock state (defensive deep copy)
  const snapshotLockedStep = useCallback(() => {
    try {
      return JSON.parse(JSON.stringify(lockedStep));
    } catch (e) {
      return lockedStep;
    }
  }, [lockedStep]);

  // Human-note: unlock all steps for the duration of the tour and open all panels for visibility
  const unlockAllStepsForTour = useCallback(() => {
    setLockedStep({
      filter: { locked: false, openPanel: true },
      analysis: { locked: false, openPanel: true },
      visualization: { locked: false, openPanel: true },
      finalize: { locked: false, openPanel: true },
    });
  }, []);

  // Human-note: toggle a body-level class while the tour runs to block interactions globally
  useEffect(() => {
    if (isTourMode) {
      document.body.classList.add('olap-tour-mode');
    } else {
      document.body.classList.remove('olap-tour-mode');
    }
    return () => {
      document.body.classList.remove('olap-tour-mode');
    };
  }, [isTourMode]);

  // Human-note: when the tour ends (complete/cancel), restore whatever locks the user really had before
  const restoreOriginalLocks = useCallback(() => {
    const snapshot = originalLockedStepRef.current;
    if (snapshot) {
      setLockedStep(snapshot);
    }
    setIsTourMode(false);
  }, []);

  // Initialize tour lazily on start to avoid race conditions with state updates
  useEffect(() => {
    // Human-note: tour is constructed on-demand inside startTour()
  }, []);

  // Start tour function
  const startTour = async () => {
    console.log('Starting tour...');
    if (tourRef.current) {
      console.log('Tour ref exists, starting tour...');
      // If a previous tour instance exists, ensure it is not active
      if (tourRef.current.isActive()) {
        tourRef.current.complete();
      }
    } else {
      console.log('Tour ref is null!');
    }

    try {
      // Human-note: snapshot existing locks and switch the page into a non-interactive "tour mode"
      originalLockedStepRef.current = snapshotLockedStep();
      setIsTourMode(true);
      unlockAllStepsForTour();

      // Wait a tick so the UI can render the unlocked/open panels
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 150)));

      const currentContext = { indicatorQuery, analysisRef, visRef, indicator, lockedStep };
      const steps = createTourSteps(currentContext);

      // Create new tour with stable configuration
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 12,
        defaultStepOptions: {
          classes: 'shepherd-theme-custom',
          scrollTo: true,
          showCancelLink: true,
          cancelIcon: { enabled: true },
          highlightClass: 'shepherd-highlight',
        },
        confirmCancel: true,
        confirmCancelMessage: 'Are you sure you want to end the tour?',
        autoStart: false,
      });

      steps.forEach(step => tour.addStep(step));

      tour.on('complete', () => {
        restoreOriginalLocks();
      });
      tour.on('cancel', () => {
        restoreOriginalLocks();
      });

      // If the first step is attached to a selector, wait for it to exist
      try {
        const first = steps?.[0];
        const sel = first?.attachTo?.element;
        if (typeof sel === 'string' && sel !== 'body') {
          const waitFor = async (selector, attempts = 10) => {
            for (let i = 0; i < attempts; i += 1) {
              const el = document.querySelector(selector);
              if (el && el.offsetParent !== null) return true;
              // wait a bit longer for layout
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, 100));
            }
            return false;
          };
          await waitFor(sel, 15);
        }
      } catch (e) {
        // non-fatal; tour will still start centered if target missing
      }

      tourRef.current = tour;
      tour.start();
    } catch (error) {
      console.error('Error starting tour:', error);
      // Fail-safe restore
      restoreOriginalLocks();
    }
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
  };

  return (
    <BasicIndicatorContext.Provider
      value={{
        indicatorQuery,
        setIndicatorQuery,
        analysisRef,
        setAnalysisRef,
        visRef,
        setVisRef,
        indicator,
        setIndicator,
        generate,
        setGenerate,
        loading,
        setLoading,
        chartConfiguration,
        setChartConfiguration,
        analysisInputMenu,
        setAnalysisInputMenu,
        lockedStep,
        setLockedStep,
        handleSaveNewBasicIndicator,
        startTour
      }}
    >
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
