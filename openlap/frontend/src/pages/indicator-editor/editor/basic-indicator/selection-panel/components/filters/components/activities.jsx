import { useEffect, useContext, useState } from "react"; // geändert: useState importiert
import {
  Chip,
  Grid,
  Typography,
  TextField,
  Autocomplete,
  Divider,
  Tooltip,
  Checkbox, // geändert: Checkbox importiert
  Button,   // geändert: Button importiert
  Box,      // geändert: Box importiert
} from "@mui/material";
import { AuthContext } from "../../../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { fetchActivitiesList } from "../utils/filters-api.js";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";

const Activities = ({ state, setState }) => {
  const { api } = useContext(AuthContext);
  const {
    setAnalysisRef,
    indicatorQuery,
    setIndicatorQuery,
    setAnalysisInputMenu,
  } = useContext(BasicIndicatorContext);

  // --- NEU: State für Checkboxen und Autocomplete-Open ---
  const [autocompleteOpen, setAutocompleteOpen] = useState(false); // geändert
  const [pendingCheckedOptions, setPendingCheckedOptions] = useState({}); // geändert

  useEffect(() => {
    const loadActivitiesData = async () => {
      try {
        const activitiesData = await fetchActivitiesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms,
          indicatorQuery.activityTypes
        );
        // TODO: why not filtered with selected??
        setState((prevState) => ({
          ...prevState,
          activitiesList: activitiesData.filter(
            (activity) =>
              !prevState.selectedActivitiesList.includes(activity.id)
          ),
        }));
      } catch (error) {
        console.log("Failed to load Activities list", error);
      }
    };
    if (indicatorQuery.activityTypes.length > 0) {
      loadActivitiesData();
    }
  }, [indicatorQuery.activityTypes.length]);

  // --- NEU: Checkbox-Handler ---
  const handleCheckboxChange = (id) => {
    setPendingCheckedOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllCheckboxes = () => {
    const allChecked = {};
    state.activitiesList.forEach((option) => {
      allChecked[option.id] = true;
    });
    setPendingCheckedOptions(allChecked);
  };

  const handleDeselectAllCheckboxes = () => {
    setPendingCheckedOptions({});
  };

  const areAllChecked =
    state.activitiesList.length > 0 &&
    state.activitiesList.every((option) => pendingCheckedOptions[option.id]);

  const isAnyChecked = Object.values(pendingCheckedOptions).some(Boolean);

  // --- NEU: Apply Handler ---
  const handleApplyChecked = () => {
    // IDs der ausgewählten Checkboxen
    const selectedIds = Object.entries(pendingCheckedOptions)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);

    // Die ausgewählten Activity-Objekte
    const selectedActivities = state.activitiesList.filter((activity) =>
      selectedIds.includes(activity.id)
    );

    // State aktualisieren: ausgewählte Activities verschieben
    setState((prevState) => ({
      ...prevState,
      selectedActivitiesList: [
        ...prevState.selectedActivitiesList,
        ...selectedActivities,
      ],
      activitiesList: prevState.activitiesList.filter(
        (activity) => !selectedIds.includes(activity.id)
      ),
    }));

    // IndicatorQuery aktualisieren (wie bei handleSelectActivities)
    selectedActivities.forEach((selectedActivity) => {
      setIndicatorQuery((prevState) => {
        const { queryId, name } = selectedActivity;
        let tempActivities = { ...prevState.activities };
        if (tempActivities[queryId]) {
          if (!tempActivities[queryId].includes(name)) {
            tempActivities[queryId].push(name);
          }
        } else {
          tempActivities[queryId] = [name];
        }
        let tempActivityKeys = Object.keys(tempActivities);
        setAnalysisInputMenu((prevState) => ({
          ...prevState,
          activities: {
            ...prevState.activities,
            id: tempActivityKeys.length === 1 ? tempActivityKeys[0] : undefined,
            options: tempActivityKeys,
          },
        }));

        return {
          ...prevState,
          activities: tempActivities,
        };
      });
    });

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    setPendingCheckedOptions({});
  };

  const handleSelectActivities = (selectedActivity) => {
    setState((prevState) => ({
      ...prevState,
      activitiesList: prevState.activitiesList.filter(
        (item) => item.id !== selectedActivity.id
      ),
      selectedActivitiesList: [
        ...prevState.selectedActivitiesList,
        selectedActivity,
      ],
      autoCompleteValue: null,
    }));

    // If query is changed
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    setIndicatorQuery((prevState) => {
      const { queryId, name } = selectedActivity;
      let tempActivities = { ...prevState.activities };
      if (tempActivities[queryId]) {
        if (!tempActivities[queryId].includes(name)) {
          tempActivities[queryId].push(name);
        }
      } else {
        tempActivities[queryId] = [name];
      }
      let tempActivityKeys = Object.keys(tempActivities);
      setAnalysisInputMenu((prevState) => ({
        ...prevState,
        activities: {
          ...prevState.activities,
          id: tempActivityKeys.length === 1 ? tempActivityKeys[0] : undefined,
          options: tempActivityKeys,
        },
      }));

      return {
        ...prevState,
        activities: tempActivities,
      };
    });
  };

  const handleDeselectActivity = (selectedActivity) => {
    setState((prevState) => {
      return {
        ...prevState,
        activitiesList: [...prevState.activitiesList, selectedActivity].sort(
          (a, b) => a.name.localeCompare(b.name)
        ),
        selectedActivitiesList: prevState.selectedActivitiesList.filter(
          (item) => item.id !== selectedActivity.id
        ),
        autoCompleteValue: null,
      };
    });

    setIndicatorQuery((prevState) => {
      let tempActivities = { ...prevState.activities };
      if (tempActivities[selectedActivity.queryId]) {
        const index = tempActivities[selectedActivity.queryId].indexOf(
          selectedActivity.name
        );
        if (index !== -1) {
          tempActivities[selectedActivity.queryId].splice(index, 1);
        }

        if (tempActivities[selectedActivity.queryId].length === 0) {
          delete tempActivities[selectedActivity.queryId];
        }
      }

      // If query is changed
      setAnalysisRef((prevState) => ({
        ...prevState,
        analyzedData: {},
      }));

      let tempActivityKeys = Object.keys(tempActivities);
      setAnalysisInputMenu((prevState) => ({
        ...prevState,
        activities: {
          ...prevState.activities,
          id: tempActivityKeys.length === 1 ? tempActivityKeys[0] : undefined,
          options: tempActivityKeys,
        },
      }));

      return {
        ...prevState,
        activities: tempActivities,
      };
    });
  };

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Search for Activities
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Tooltip
                arrow
                title={
                  indicatorQuery.activityTypes.length === 0 ? (
                    <Typography variant="body2">
                      Select at least one Activity Type from above to view the
                      list of Activities.
                    </Typography>
                  ) : state.selectedActionsList.length > 0 ? (
                    <Typography variant="body2">
                      Deselect all the Actions below in order to remove an
                      activity.
                    </Typography>
                  ) : undefined
                }
              >
                <Autocomplete
                  open={autocompleteOpen}
                  onOpen={() => setAutocompleteOpen(true)}
                  onClose={() => setAutocompleteOpen(false)}
                  disabled={
                    indicatorQuery.activityTypes.length === 0 ||
                    state.selectedActionsList.length > 0
                  }
                  disablePortal
                  disableCloseOnSelect
                  id="combo-box-lrs"
                  options={state.activitiesList}
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
                  getOptionLabel={(option) => option.name}
                  renderOption={(props, option, { index }) => {
                    const { key, ...restProps } = props;
                    const label = { inputProps: { "aria-label": option.name } };
                    return (
                      <>
                        {index === 0 && (
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
                                checked={areAllChecked}
                                indeterminate={isAnyChecked && !areAllChecked}
                                onChange={() => {
                                  areAllChecked
                                    ? handleDeselectAllCheckboxes()
                                    : handleSelectAllCheckboxes();
                                }}
                                sx={{ ml: 2, mr: 1 }}
                                inputProps={{ "aria-label": "Alle auswählen" }}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, mr: 1 }}>
                                {Object.values(pendingCheckedOptions).filter(Boolean).length} selected
                              </Typography>
                              <Box sx={{ flexGrow: 1 }} />
                              {isAnyChecked && (
                                <Button
                                  sx={{ mr: 2, minWidth: 0, px: 2, height: 32 }}
                                  variant="contained"
                                  size="small"
                                  color="primary"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={handleApplyChecked}
                                >
                                  Apply
                                </Button>
                              )}
                            </Box>
                          </li>
                        )}
                        <li
                          {...restProps}
                          key={key}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <Checkbox
                            {...label}
                            checked={!!pendingCheckedOptions[option.id]}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(option.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ mr: 1 }}
                          />
                          <Grid container sx={{ py: 0.5 }}>
                            <Grid item xs={12}>
                              <Typography>{option.name}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2">{option.id}</Typography>
                            </Grid>
                          </Grid>
                        </li>
                      </>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="*Activities" />
                  )}
                  onChange={(event, value) => {
                    if (value) handleSelectActivities(value);
                  }}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="flex-start">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mr: 1 }}
                >
                  Selected <b>Activity(ies)</b>
                </Typography>
                {state.selectedActivitiesList.length > 0 && (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{
                      ml: 1,
                      textDecoration: "underline",
                      cursor: "pointer",
                      userSelect: "none",
                      "&:hover": { textDecoration: "underline", color: "primary.dark" },
                    }}
                    onClick={() => {
                      // Delete all selected activities
                      setState((prevState) => ({
                        ...prevState,
                        activitiesList: [
                          ...prevState.activitiesList,
                          ...prevState.selectedActivitiesList,
                        ].sort((a, b) => a.name.localeCompare(b.name)),
                        selectedActivitiesList: [],
                      }));
                      setAnalysisRef((prevState) => ({
                        ...prevState,
                        analyzedData: {},
                      }));
                      setIndicatorQuery((prevState) => ({
                        ...prevState,
                        activities: [],
                      }));
                    }}
                  >
                    delete all
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ mt: state.selectedActivitiesList.length > 0 ? 1 : 0 }}
            >
              <Grid container spacing={1}>
                {state.selectedActivitiesList?.map((activity, index) => (
                  <Grid item key={index}>
                    <Tooltip
                      arrow
                      title={
                        indicatorQuery.actionOnActivities?.length ? (
                          <Typography variant="body2">
                            Deselect all the Actions below in order to remove an
                            activity.
                          </Typography>
                        ) : undefined
                      }
                    >
                      <Chip
                        color="primary"
                        label={activity.name}
                        onDelete={
                          indicatorQuery.actionOnActivities?.length
                            ? undefined
                            : () => handleDeselectActivity(activity)
                        }
                      />
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ mt: state.selectedActivitiesList.length > 0 ? 0.5 : 5.5 }}
            >
              <Divider />
            </Grid>
            <Grid item xs={12}>
              {indicatorQuery.actionOnActivities?.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  <i>
                    Remove all the <b>Actions</b> below to add/remove activities
                  </i>
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Activities;
