import { useEffect, useContext, useState } from "react";
import {
  Chip,
  Grid,
  Typography,
  TextField,
  Autocomplete,
  Divider,
  Tooltip,
  Checkbox,
  Box,
} from "@mui/material";
import { AuthContext } from "../../../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { fetchActionOnActivitiesList } from "../utils/filters-api.js";
import { getLastWordAndCapitalize } from "../../../utils/utils.js";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";

const ActionOnActivities = ({ state, setState }) => {
  // Get API and context functions
  const { api } = useContext(AuthContext);
  const {
    indicatorQuery,
    setIndicatorQuery,
    setAnalysisInputMenu,
    setAnalysisRef,
    setLockedStep,
    setGenerate,
    setIndicator,
    setVisRef,
  } = useContext(BasicIndicatorContext);

  // State for managing autocomplete dropdown visibility
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  // State for shift-click range selection
  const [lastCheckedIndex, setLastCheckedIndex] = useState(null);

  // Load action data when selected activities change
  // Load action data when selected activities change
  useEffect(() => {
    const loadActivityTypesData = async () => {
      try {
        const actionsData = await fetchActionOnActivitiesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms,
          indicatorQuery.activityTypes,
          indicatorQuery.activities
        );
        setState((prevState) => ({
          ...prevState,
          actionsList: actionsData,
        }));
      } catch (error) {
        console.log("Failed to load Action on Activities list", error);
      }
    };
    if (state.selectedActivitiesList.length > 0) {
      loadActivityTypesData();
    }
  }, [state.selectedActivitiesList.length]);

  // Check if an action is currently selected
  const isChecked = (id) =>
    state.selectedActionsList.some((action) => action.id === id);

  // Handle checkbox changes with support for shift-click range selection and complex state updates
  // Handle checkbox changes with support for shift-click range selection and complex state updates
  const handleCheckboxChange = (option, realIndex, event) => {
    let newSelected = [...state.selectedActionsList];
    let newActionOnActivities = [...indicatorQuery.actionOnActivities];

    // Handle shift-click for range selection
    if (event && event.shiftKey && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, realIndex);
      const end = Math.max(lastCheckedIndex, realIndex);
      const rangeOptions = state.actionsList.slice(start, end + 1);
      const shouldCheck = !isChecked(option.id);

      if (shouldCheck) {
        // Select all items in range
        rangeOptions.forEach((opt) => {
          if (!isChecked(opt.id)) {
            newSelected.push(opt);
            newActionOnActivities.push(opt.id);
          }
        });
      } else {
        // Deselect all items in range
        newSelected = newSelected.filter(
          (action) => !rangeOptions.some((opt) => opt.id === action.id)
        );
        newActionOnActivities = newActionOnActivities.filter(
          (id) => !rangeOptions.some((opt) => opt.id === id)
        );
      }
      setLastCheckedIndex(realIndex);
    } else {
      // Handle single click selection/deselection
      if (isChecked(option.id)) {
        newSelected = newSelected.filter((action) => action.id !== option.id);
        newActionOnActivities = newActionOnActivities.filter(
          (id) => id !== option.id
        );
      } else {
        newSelected.push(option);
        newActionOnActivities.push(option.id);
      }
      setLastCheckedIndex(realIndex);
    }

    // Update main state and query
    setState((prevState) => ({
      ...prevState,
      selectedActionsList: newSelected,
    }));

    setIndicatorQuery((prevState) => ({
      ...prevState,
      actionOnActivities: newActionOnActivities,
    }));

    // Clear analyzed data when selection changes
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Update analysis input menu with unique query IDs
    const uniqueQueryIds = [...new Set(newSelected.map((item) => item.queryId))];
    setAnalysisInputMenu((prevInputState) => ({
      ...prevInputState,
      actionOnActivities: {
        ...prevInputState.actionOnActivities,
        id: uniqueQueryIds.length === 1 ? uniqueQueryIds[0] : undefined,
        options: uniqueQueryIds,
      },
    }));

    // Reset visualization pipeline when actions change
    setVisRef((prevState) => ({
      ...prevState,
      visualizationLibraryId: "",
      visualizationTypeId: "",
      visualizationMapping: {
        ...prevState.visualizationMapping,
        mapping: [],
      },
    }));
    setGenerate(false);
    setIndicator((prevState) => ({
      ...prevState,
      previewData: {
        ...prevState.previewData,
        displayCode: [],
        scriptData: "",
      },
    }));
    setLockedStep((prevState) => ({
      ...prevState,
      visualization: {
        locked: true,
        openPanel: false,
      },
      finalize: {
        ...prevState.finalize,
        locked: true,
        openPanel: false,
      },
    }));
  };

  // Check states for "Select All" checkbox
  const allChecked =
    state.actionsList.length > 0 &&
    state.actionsList.every((option) => isChecked(option.id));
  
  const anyChecked =
    state.actionsList.some((option) => isChecked(option.id));

  // Handle "Select All" / "Deselect All" functionality with complex state management
  // Handle "Select All" / "Deselect All" functionality with complex state management
  const handleSelectAll = () => {
    if (allChecked) {
      // Deselect all actions
      const newSelected = state.selectedActionsList.filter(
        (action) => !state.actionsList.some((opt) => opt.id === action.id)
      );
      const newActionOnActivities = indicatorQuery.actionOnActivities.filter(
        (id) => !state.actionsList.some((opt) => opt.id === id)
      );

      setState((prevState) => ({
        ...prevState,
        selectedActionsList: newSelected,
      }));

      setIndicatorQuery((prevState) => ({
        ...prevState,
        actionOnActivities: newActionOnActivities,
      }));
    } else {
      // Select all actions
      const newSelected = [
        ...state.selectedActionsList,
        ...state.actionsList.filter(
          (opt) => !state.selectedActionsList.some((action) => action.id === opt.id)
        ),
      ];
      const newActionOnActivities = [
        ...indicatorQuery.actionOnActivities,
        ...state.actionsList
          .map((opt) => opt.id)
          .filter((id) => !indicatorQuery.actionOnActivities.includes(id)),
      ];

      setState((prevState) => ({
        ...prevState,
        selectedActionsList: newSelected,
      }));

      setIndicatorQuery((prevState) => ({
        ...prevState,
        actionOnActivities: newActionOnActivities,
      }));
    }

    // Update analysis input menu with appropriate query IDs
    const uniqueQueryIds = [...new Set(
      allChecked
        ? state.selectedActionsList
            .filter((action) => !state.actionsList.some((opt) => opt.id === action.id))
            .map((item) => item.queryId)
        : [
            ...state.selectedActionsList.map((item) => item.queryId),
            ...state.actionsList.map((item) => item.queryId),
          ]
    )];

    setAnalysisInputMenu((prevInputState) => ({
      ...prevInputState,
      actionOnActivities: {
        ...prevInputState.actionOnActivities,
        id: uniqueQueryIds.length === 1 ? uniqueQueryIds[0] : undefined,
        options: uniqueQueryIds,
      },
    }));

    // Clear analyzed data
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Reset visualization pipeline
    setVisRef((prevState) => ({
      ...prevState,
      visualizationLibraryId: "",
      visualizationTypeId: "",
      visualizationMapping: {
        ...prevState.visualizationMapping,
        mapping: [],
      },
    }));
    setGenerate(false);
    setIndicator((prevState) => ({
      ...prevState,
      previewData: {
        ...prevState.previewData,
        displayCode: [],
        scriptData: "",
      },
    }));
    setLockedStep((prevState) => ({
      ...prevState,
      visualization: {
        locked: true,
        openPanel: false,
      },
      finalize: {
        ...prevState.finalize,
        locked: true,
        openPanel: false,
      },
    }));
  };

  // Handle deselecting a single action with full pipeline reset
  // Handle deselecting a single action with full pipeline reset
  const handleDeselectActionOnActivity = (selectedAction) => {
    setState((prevState) => ({
      ...prevState,
      selectedActionsList: prevState.selectedActionsList.filter(
        (item) => item.id !== selectedAction.id
      ),
    }));

    setIndicatorQuery((prevState) => ({
      ...prevState,
      actionOnActivities: prevState.actionOnActivities.filter(
        (item) => item !== selectedAction.id
      ),
    }));

    // Clear analyzed data
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Update analysis input menu
    const uniqueQueryIds = [
      ...new Set(
        state.selectedActionsList
          .filter((action) => action.id !== selectedAction.id)
          .map((item) => item.queryId)
      ),
    ];
    setAnalysisInputMenu((prevInputState) => ({
      ...prevInputState,
      actionOnActivities: {
        ...prevInputState.actionOnActivities,
        id: uniqueQueryIds.length === 1 ? uniqueQueryIds[0] : undefined,
        options: uniqueQueryIds,
      },
    }));

    // Reset visualization pipeline
    setVisRef((prevState) => ({
      ...prevState,
      visualizationLibraryId: "",
      visualizationTypeId: "",
      visualizationMapping: {
        ...prevState.visualizationMapping,
        mapping: [],
      },
    }));
    setGenerate(false);
    setIndicator((prevState) => ({
      ...prevState,
      previewData: {
        ...prevState.previewData,
        displayCode: [],
        scriptData: "",
      },
    }));
    setLockedStep((prevState) => ({
      ...prevState,
      visualization: {
        locked: true,
        openPanel: false,
      },
      finalize: {
        ...prevState.finalize,
        locked: true,
        openPanel: false,
      },
    }));
  };

  // Handle clearing all selected actions (Clear All functionality)
  // Handle clearing all selected actions (Clear All functionality)
  const handleDeleteAllSelected = () => {
    setState((prevState) => ({
      ...prevState,
      selectedActionsList: [],
    }));

    setIndicatorQuery((prevState) => ({
      ...prevState,
      actionOnActivities: [],
    }));

    // Clear analyzed data
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Reset analysis input menu
    setAnalysisInputMenu((prevInputState) => ({
      ...prevInputState,
      actionOnActivities: {
        ...prevInputState.actionOnActivities,
        id: undefined,
        options: [],
      },
    }));

    // Reset entire visualization pipeline
    setVisRef((prevState) => ({
      ...prevState,
      visualizationLibraryId: "",
      visualizationTypeId: "",
      visualizationMapping: {
        ...prevState.visualizationMapping,
        mapping: [],
      },
    }));
    setGenerate(false);
    setIndicator((prevState) => ({
      ...prevState,
      previewData: {
        ...prevState.previewData,
        displayCode: [],
        scriptData: "",
      },
    }));
    setLockedStep((prevState) => ({
      ...prevState,
      visualization: {
        locked: true,
        openPanel: false,
      },
      finalize: {
        ...prevState.finalize,
        locked: true,
        openPanel: false,
      },
    }));
  };

  // Clean up selected actions when activities change - only remove actions that are no longer available
  useEffect(() => {
    // Only clean up if we have selected actions and the available actions list has been loaded
    if (state.selectedActionsList.length > 0 && state.actionsList.length >= 0) {
      // Filter out actions that are no longer available in the current actionsList
      // This means the action is only removed if it's not supported by any of the remaining activities
      const stillAvailableActions = state.selectedActionsList.filter(selectedAction =>
        state.actionsList.some(availableAction => availableAction.id === selectedAction.id)
      );

      // Only update if some actions were actually removed
      if (stillAvailableActions.length !== state.selectedActionsList.length) {
        const newActionOnActivities = stillAvailableActions.map(action => action.id);

        setState((prevState) => ({
          ...prevState,
          selectedActionsList: stillAvailableActions,
        }));

        setIndicatorQuery((prevState) => ({
          ...prevState,
          actionOnActivities: newActionOnActivities,
        }));

        // Update analysis input menu with remaining actions
        const uniqueQueryIds = [...new Set(stillAvailableActions.map((item) => item.queryId))];
        setAnalysisInputMenu((prevInputState) => ({
          ...prevInputState,
          actionOnActivities: {
            ...prevInputState.actionOnActivities,
            id: uniqueQueryIds.length === 1 ? uniqueQueryIds[0] : undefined,
            options: uniqueQueryIds,
          },
        }));

        // Clear analyzed data
        setAnalysisRef((prevState) => ({
          ...prevState,
          analyzedData: {},
        }));

        // Reset visualization pipeline
        setVisRef((prevState) => ({
          ...prevState,
          visualizationLibraryId: "",
          visualizationTypeId: "",
          visualizationMapping: {
            ...prevState.visualizationMapping,
            mapping: [],
          },
        }));
        setGenerate(false);
        setIndicator((prevState) => ({
          ...prevState,
          previewData: {
            ...prevState.previewData,
            displayCode: [],
            scriptData: "",
          },
        }));
        setLockedStep((prevState) => ({
          ...prevState,
          visualization: {
            locked: true,
            openPanel: false,
          },
          finalize: {
            ...prevState.finalize,
            locked: true,
            openPanel: false,
          },
        }));
      }
    }
  }, [state.actionsList, setState, setIndicatorQuery, setAnalysisInputMenu, setAnalysisRef, setVisRef, setGenerate, setIndicator, setLockedStep]);

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Left column: Search and filter actions */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Search for Actions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Tooltip
                arrow
                title={
                  Object.entries(indicatorQuery.activities).length === 0 ? (
                    <Typography variant="body2">
                      Select at least one Activity from above to view the list
                      of Actions.
                    </Typography>
                  ) : undefined
                }
              >
                <Autocomplete
                  open={autocompleteOpen}
                  onOpen={() => setAutocompleteOpen(true)}
                  onClose={() => setAutocompleteOpen(false)}
                  disabled={
                    Object.entries(indicatorQuery.activities).length === 0
                  }
                  disablePortal
                  disableCloseOnSelect
                  id="combo-box-lrs"
                  options={state.actionsList}
                  fullWidth
                  slotProps={{
                    listbox: {
                      style: {
                        maxHeight: "240px",
                        paddingTop: 0,
                        marginTop: 0,
                      },
                    },
                  }}
                  getOptionLabel={(option) => option?.name}
                  renderOption={(props, option) => {
                    const realIndex = state.actionsList.findIndex(
                      (o) => o.id === option.id
                    );
                    return (
                      <>
                        {/* Render sticky "Select All" header for first item */}
                        {realIndex === 0 && (
                          <li
                            style={{
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                              background: "#fff",
                              borderBottom: "1px solid #eee",
                              width: "100%",
                              margin: 0,
                              padding: 0,
                              left: 0,
                              right: 0,
                              boxSizing: "border-box",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                px: 0,
                                py: 0,
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                height: "40px",
                              }}
                            >
                              <Checkbox
                                checked={allChecked}
                                indeterminate={anyChecked && !allChecked}
                                onChange={handleSelectAll}
                                sx={{ ml: 2, mr: 1 }}
                                inputProps={{ "aria-label": "Alle auswählen" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 24, mr: 1 }}
                              >
                                {state.selectedActionsList.length} selected
                              </Typography>
                            </Box>
                          </li>
                        )}
                        {/* Render individual action options */}
                        <li
                          {...props}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <Checkbox
                            checked={isChecked(option.id)}
                            onClick={(e) => handleCheckboxChange(option, realIndex, e)}
                            sx={{ mr: 1 }}
                          />
                          <Grid
                            container
                            sx={{ py: 0.5 }}
                            onClick={(e) => handleCheckboxChange(option, realIndex, e)}
                            style={{ cursor: "pointer" }}
                          >
                            <Grid item xs={12}>
                              <Typography>{option?.name}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2">{option?.id}</Typography>
                            </Grid>
                          </Grid>
                        </li>
                      </>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="*Actions" />
                  )}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        {/* Right column: Selected actions display */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  Selected <b>Action(s)</b>
                </Typography>
                {/* Clear All button - only visible when actions are selected */}
                {state.selectedActionsList.length > 0 && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#1976d2', 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      '&:hover': { color: '#1565c0' }
                    }}
                    onClick={handleDeleteAllSelected}
                  >
                    Clear All
                  </Typography>
                )}
              </Box>
            </Grid>
            {/* Display selected actions as chips */}
            <Grid item xs={12}>
              <Grid container spacing={1}>
                {state.selectedActionsList?.map((action, index) => (
                  <Grid item key={index}>
                    <Chip
                      color="primary"
                      label={getLastWordAndCapitalize(action.name)}
                      onDelete={() => handleDeselectActionOnActivity(action)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            {/* Divider at bottom */}
            <Grid
              item
              xs={12}
              sx={{ mt: state.selectedActionsList.length > 0 ? 0.5 : 5.5 }}
            >
              <Divider />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ActionOnActivities;