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

  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [lastCheckedIndex, setLastCheckedIndex] = useState(null);

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

  const isChecked = (id) =>
    state.selectedActionsList.some((action) => action.id === id);

  const handleCheckboxChange = (option, realIndex, event) => {
    let newSelected = [...state.selectedActionsList];
    let newActionOnActivities = [...indicatorQuery.actionOnActivities];

    if (event && event.shiftKey && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, realIndex);
      const end = Math.max(lastCheckedIndex, realIndex);
      const rangeOptions = state.actionsList.slice(start, end + 1);
      const shouldCheck = !isChecked(option.id);

      if (shouldCheck) {
        rangeOptions.forEach((opt) => {
          if (!isChecked(opt.id)) {
            newSelected.push(opt);
            newActionOnActivities.push(opt.id);
          }
        });
      } else {
        newSelected = newSelected.filter(
          (action) => !rangeOptions.some((opt) => opt.id === action.id)
        );
        newActionOnActivities = newActionOnActivities.filter(
          (id) => !rangeOptions.some((opt) => opt.id === id)
        );
      }
      setLastCheckedIndex(realIndex);
    } else {
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

    setState((prevState) => ({
      ...prevState,
      selectedActionsList: newSelected,
    }));

    setIndicatorQuery((prevState) => ({
      ...prevState,
      actionOnActivities: newActionOnActivities,
    }));

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Update analysis input menu
    const uniqueQueryIds = [...new Set(newSelected.map((item) => item.queryId))];
    setAnalysisInputMenu((prevInputState) => ({
      ...prevInputState,
      actionOnActivities: {
        ...prevInputState.actionOnActivities,
        id: uniqueQueryIds.length === 1 ? uniqueQueryIds[0] : undefined,
        options: uniqueQueryIds,
      },
    }));

    // Reset visualization if actions are changed
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

  const allChecked =
    state.actionsList.length > 0 &&
    state.actionsList.every((option) => isChecked(option.id));
  
  const anyChecked =
    state.actionsList.some((option) => isChecked(option.id));

  const handleSelectAll = () => {
    if (allChecked) {
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

    // Update analysis input menu
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

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Reset visualization
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

    // Reset visualization
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

  const handleDeleteAllSelected = () => {
    setState((prevState) => ({
      ...prevState,
      selectedActionsList: [],
    }));

    setIndicatorQuery((prevState) => ({
      ...prevState,
      actionOnActivities: [],
    }));

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Update analysis input menu
    setAnalysisInputMenu((prevInputState) => ({
      ...prevInputState,
      actionOnActivities: {
        ...prevInputState.actionOnActivities,
        id: undefined,
        options: [],
      },
    }));

    // Reset visualization
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

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 4 }}>
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

        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mr: 1 }}
                >
                  Selected <b>Action(s)</b>
                </Typography>
              </Box>
            </Grid>
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