import {
  AccordionSummary,
  Chip,
  Grid,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import StepHelpDialog from '../../../../components/StepHelpDialog';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import LRSChips from "./lrs-chips.jsx";
import PlatformChips from "./platform-chips.jsx";

const DatasetSummary = ({
  state,
  handleToggleShowSelection,
  handleTogglePanel,
}) => {
  return (
    <>
      <AccordionSummary 
        aria-controls="panel1-content" 
        id="panel1-header"
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
                    <Chip label="1" color="primary" />
                  </Grid>
                  <Grid item>
                    <Typography>Dataset</Typography>
                  </Grid>
                  <Grid item>
                    <StepHelpDialog title="Dataset" description="Select the Learning Record Store (LRS) and Platforms for the indicator data source." />
                  </Grid>
                  {!state.openPanel && (
                    <>
                      <Grid item>
                        <Tooltip title="Edit dataset selection">
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
              {state.openPanel && (
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
          {!state.openPanel && state.showSelections && (
            <>
              <LRSChips />
              <PlatformChips />
            </>
          )}
        </Grid>
      </AccordionSummary>
    </>
  );
};

export default DatasetSummary;
