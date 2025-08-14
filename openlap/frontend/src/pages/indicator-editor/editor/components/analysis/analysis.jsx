import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Grid,
  Grow,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import AnalyticsTechnique from "./components/analytics-technique.jsx";
import InputsBasicIndicator from "./components/inputs-basic-indicator.jsx";
import Params from "./components/params.jsx";
import AnalyzedDataTable from "../analyzed-data-table/analyzed-data-table.jsx";

import { useSnackbar } from "notistack";
import InputsMultiLevelIndicator from "./components/inputs-multi-level-indicator.jsx";
import StepHelpDialog from '../../basic-indicator/components/StepHelpDialog';

const Analysis = ({
  lockedStep,
  setLockedStep,
  indicator,
  analysisRef,
  setAnalysisRef,
  setIndicator,
  setGenerate,
  setVisRef,
  loadAnalyzedData,
}) => {
  const [state, setState] = useState(() => {
    const savedState = sessionStorage.getItem("analysis");
    return savedState
      ? JSON.parse(savedState)
      : {
          showSelections: true,
          techniqueList: [],
          inputs: [],
          parameters: [],
          autoCompleteValue: null,
          loadingPreview: false,
        };
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    sessionStorage.setItem("analysis", JSON.stringify(state));
  }, [state]);

  const handleTogglePanel = () => {
    setLockedStep((prevState) => ({
      ...prevState,
      analysis: {
        ...prevState.analysis,
        openPanel: !prevState.analysis.openPanel,
      },
    }));
  };

  const handleToggleShowSelection = () => {
    setState((prevState) => ({
      ...prevState,
      showSelections: !prevState.showSelections,
    }));
  };

  const handlePreviewAnalyzedData = () => {
    setState((prevState) => ({
      ...prevState,
      loadingPreview: true,
    }));
    loadAnalyzedData()
      .then((response) => {
        setAnalysisRef((prevState) => ({
          ...prevState,
          analyzedData: response.data,
        }));
        setState((prevState) => ({
          ...prevState,
          loadingPreview: false,
        }));
        enqueueSnackbar(response.message, { variant: "success" });
      })
      .catch((error) => {
        setState((prevState) => ({
          ...prevState,
          loadingPreview: false,
        }));
        enqueueSnackbar(error.message, { variant: "error" });
      });
  };

  const handleUnlockVisualization = () => {
    handleTogglePanel();
    setLockedStep((prevState) => ({
      ...prevState,
      visualization: {
        ...prevState.visualization,
        locked: false,
        openPanel: true,
      },
    }));
  };

  return (
    <>
      <Accordion
        expanded={lockedStep.analysis.openPanel}
        disabled={lockedStep.analysis.locked}
      >
        <AccordionSummary
          expandIcon={null}
          sx={{ pointerEvents: 'none' }}
        >
          <Grid container spacing={1}>
            {/* Label */}
            <Grid item xs={12}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      {!lockedStep.analysis.locked ? (
                        <Chip label="3" color="primary" />
                      ) : (
                        <IconButton size="small">
                          <LockIcon />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item>
                      <Typography>Analysis</Typography>
                    </Grid>
                    <Grid item>
                      <StepHelpDialog title="Analysis" description="Define metrics or logic to be applied on the dataset." />
                    </Grid>
                    {!lockedStep.analysis.locked &&
                      !lockedStep.analysis.openPanel && (
                        <>
                          <Grid item>
                            <Tooltip title="Edit analysis selection">
                              <IconButton 
                                onClick={handleTogglePanel}
                                sx={{ pointerEvents: 'auto' }}
                              >
                                <EditIcon color="primary" />
                              </IconButton>
                            </Tooltip>
                          </Grid>

                          <Grid item>
                            <Tooltip
                              title={
                                !state.showSelections
                                  ? "Show summary"
                                  : "Hide summary"
                              }
                            >
                              <IconButton 
                                onClick={handleToggleShowSelection}
                                sx={{ pointerEvents: 'auto' }}
                              >
                                {!state.showSelections ? (
                                  <VisibilityIcon color="primary" />
                                ) : (
                                  <VisibilityOffIcon color="primary" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </>
                      )}
                  </Grid>
                </Grid>
                {!lockedStep.analysis.locked &&
                  lockedStep.analysis.openPanel && (
                    <Grid item>
                      <Tooltip title="Close panel">
                        <IconButton 
                          onClick={handleTogglePanel}
                          sx={{ pointerEvents: 'auto' }}
                        >
                          <CloseIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  )}
              </Grid>
            </Grid>
            {!lockedStep.analysis.openPanel && state.showSelections && (
              <>
                {/* Analytics Technique */}
                {analysisRef.analyticsTechniqueId.length > 0 && (
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography>Analysis method:</Typography>
                      </Grid>
                      <Grid item xs>
                        <Grid container spacing={1}>
                          {state.techniqueList?.map((technique, index) => {
                            if (
                              technique.id === analysisRef.analyticsTechniqueId
                            ) {
                              return (
                                <Grid item key={index}>
                                  <Chip label={technique.name} />
                                </Grid>
                              );
                            }
                            return undefined;
                          })}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {/* Analysis inputs */}
                {analysisRef.analyticsTechniqueMapping.mapping.length > 0 && (
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography>Inputs:</Typography>
                      </Grid>
                      <Grid item xs>
                        <Grid container spacing={1}>
                          {analysisRef.analyticsTechniqueMapping.mapping.map(
                            (mapping, index) => (
                              <Grid item key={index}>
                                <Chip
                                  label={`${mapping.inputPort.title}: ${mapping.outputPort.title}`}
                                />
                              </Grid>
                            )
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {/* Parameters */}
                {analysisRef.analyticsTechniqueParams.length > 0 && (
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography>Additional parameters:</Typography>
                      </Grid>
                      <Grid item xs>
                        <Grid container spacing={1}>
                          {analysisRef.analyticsTechniqueParams?.map(
                            (param, index) => (
                              <Grid item key={index}>
                                <Chip
                                  label={`${param.title}: ${param.value}`}
                                />
                              </Grid>
                            )
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {/* Outputs */}
                {Object.entries(analysisRef.analyzedData).length !== 0 && (
                  <Grid item xs={12}>
                    <AnalyzedDataTable
                      analyzedData={analysisRef.analyzedData}
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <AnalyticsTechnique
                state={state}
                setState={setState}
                analysisRef={analysisRef}
                setAnalysisRef={setAnalysisRef}
                setLockedStep={setLockedStep}
                setGenerate={setGenerate}
                setIndicator={setIndicator}
                setVisRef={setVisRef}
              />
            </Grid>
            <Grow
              timeout={{ enter: 500, exit: 0 }}
              in={analysisRef.analyticsTechniqueId.length !== 0}
              unmountOnExit
            >
              {state.inputs.length > 0 ? (
                <>
                  <Grid item xs={12}>
                    {indicator.type === "BASIC" && (
                      <InputsBasicIndicator state={state} setState={setState} />
                    )}
                    {indicator.type === "MULTI_LEVEL" && (
                      <InputsMultiLevelIndicator
                        state={state}
                        setState={setState}
                      />
                    )}
                  </Grid>
                  {state.parameters.length > 0 ? (
                    <Grid item xs={12}>
                      <Params
                        analysisRef={analysisRef}
                        setAnalysisRef={setAnalysisRef}
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <Skeleton variant="rectangular" height={118} />
                    </Grid>
                  )}
                </>
              ) : (
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" height={118} />
                </Grid>
              )}
            </Grow>
            {Object.entries(analysisRef.analyzedData).length !== 0 && (
              <Grid item xs={12}>
                <AnalyzedDataTable analyzedData={analysisRef.analyzedData} />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
        <AccordionActions>
          <Grid container spacing={2}>
            <Grid item xs>
              <Button
                className="shepherd-preview-data-btn"
                variant="contained"
                fullWidth
                disabled={
                  !analysisRef.analyticsTechniqueId.length ||
                  !analysisRef.analyticsTechniqueMapping.mapping.length ||
                  !analysisRef.analyticsTechniqueParams.length ||
                  state.loadingPreview
                }
                onClick={handlePreviewAnalyzedData}
              >
                {state.loadingPreview ? "Loading…" : "Preview data"}
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                className="shepherd-next-btn-analysis"
                variant="contained"
                fullWidth
                disabled={
                  !analysisRef.analyticsTechniqueId.length ||
                  !analysisRef.analyticsTechniqueMapping.mapping.length ||
                  !analysisRef.analyticsTechniqueParams.length ||
                  Object.entries(analysisRef.analyzedData).length === 0
                }
                onClick={handleUnlockVisualization}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        </AccordionActions>
      </Accordion>
    </>
  );
};

export default Analysis;
