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
  Button,
  Box,
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

  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [lastCheckedIndex, setLastCheckedIndex] = useState(null);

  useEffect(() => {
    const loadActivitiesData = async () => {
      try {
        const activitiesData = await fetchActivitiesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms,
          indicatorQuery.activityTypes
        );
        setState((prevState) => ({
          ...prevState,
          activitiesList: activitiesData,
        }));
      } catch (error) {
        console.log("Failed to load Activities list", error);
      }
    };
    if (indicatorQuery.activityTypes.length > 0) {
      loadActivitiesData();
    }
  }, [indicatorQuery.activityTypes.length]);

  const isChecked = (id) =>
    state.selectedActivitiesList.some((activity) => activity.id === id);

  const handleCheckboxChange = (option, realIndex, event) => {
    let newSelected = [...state.selectedActivitiesList];
    let newActivities = { ...indicatorQuery.activities };

    if (event && event.shiftKey && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, realIndex);
      const end = Math.max(lastCheckedIndex, realIndex);
      const rangeOptions = state.activitiesList.slice(start, end + 1);
      const shouldCheck = !isChecked(option.id);

      if (shouldCheck) {
        rangeOptions.forEach((opt) => {
          if (!isChecked(opt.id)) {
            newSelected.push(opt);
            if (newActivities[opt.queryId]) {
              if (!newActivities[opt.queryId].includes(opt.name)) {
                newActivities[opt.queryId].push(opt.name);
              }
            } else {
              newActivities[opt.queryId] = [opt.name];
            }
          }
        });
      } else {
        newSelected = newSelected.filter(
          (activity) => !rangeOptions.some((opt) => opt.id === activity.id)
        );
        rangeOptions.forEach((opt) => {
          if (newActivities[opt.queryId]) {
            newActivities[opt.queryId] = newActivities[opt.queryId].filter(
              (name) => name !== opt.name
            );
            if (newActivities[opt.queryId].length === 0) {
              delete newActivities[opt.queryId];
            }
          }
        });
      }
      setLastCheckedIndex(realIndex);
    } else {
      if (isChecked(option.id)) {
        newSelected = newSelected.filter((activity) => activity.id !== option.id);
        if (newActivities[option.queryId]) {
          newActivities[option.queryId] = newActivities[option.queryId].filter(
            (name) => name !== option.name
          );
          if (newActivities[option.queryId].length === 0) {
            delete newActivities[option.queryId];
          }
        }
      } else {
        newSelected.push(option);
        if (newActivities[option.queryId]) {
          if (!newActivities[option.queryId].includes(option.name)) {
            newActivities[option.queryId].push(option.name);
          }
        } else {
          newActivities[option.queryId] = [option.name];
        }
      }
      setLastCheckedIndex(realIndex);
    }

    setState((prevState) => ({
      ...prevState,
      selectedActivitiesList: newSelected,
    }));

    const tempActivityKeys = Object.keys(newActivities);
    setAnalysisInputMenu((prevState) => ({
      ...prevState,
      activities: {
        ...prevState.activities,
        id: tempActivityKeys.length === 1 ? tempActivityKeys[0] : undefined,
        options: tempActivityKeys,
      },
    }));

    setIndicatorQuery((prevState) => ({
      ...prevState,
      activities: newActivities,
    }));

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  const allChecked =
    state.activitiesList.length > 0 &&
    state.activitiesList.every((option) => isChecked(option.id));
  
  const anyChecked =
    state.activitiesList.some((option) => isChecked(option.id));

  const handleSelectAll = () => {
    if (allChecked) {
      const newActivities = { ...indicatorQuery.activities };
      state.activitiesList.forEach((opt) => {
        if (newActivities[opt.queryId]) {
          newActivities[opt.queryId] = newActivities[opt.queryId].filter(
            (name) => name !== opt.name
          );
          if (newActivities[opt.queryId].length === 0) {
            delete newActivities[opt.queryId];
          }
        }
      });

      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: prevState.selectedActivitiesList.filter(
          (activity) => !state.activitiesList.some((opt) => opt.id === activity.id)
        ),
      }));

      setIndicatorQuery((prevState) => ({
        ...prevState,
        activities: newActivities,
      }));
    } else {
      const newSelected = [
        ...state.selectedActivitiesList,
        ...state.activitiesList.filter(
          (opt) => !state.selectedActivitiesList.some((activity) => activity.id === opt.id)
        ),
      ];
      const newActivities = { ...indicatorQuery.activities };
      state.activitiesList.forEach((opt) => {
        if (!isChecked(opt.id)) {
          if (newActivities[opt.queryId]) {
            if (!newActivities[opt.queryId].includes(opt.name)) {
              newActivities[opt.queryId].push(opt.name);
            }
          } else {
            newActivities[opt.queryId] = [opt.name];
          }
        }
      });

      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: newSelected,
      }));

      setIndicatorQuery((prevState) => ({
        ...prevState,
        activities: newActivities,
      }));
    }

    const tempActivityKeys = Object.keys(indicatorQuery.activities);
    setAnalysisInputMenu((prevState) => ({
      ...prevState,
      activities: {
        ...prevState.activities,
        id: tempActivityKeys.length === 1 ? tempActivityKeys[0] : undefined,
        options: tempActivityKeys,
      },
    }));

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  const handleDeselectActivity = (selectedActivity) => {
    setState((prevState) => ({
      ...prevState,
      selectedActivitiesList: prevState.selectedActivitiesList.filter(
        (item) => item.id !== selectedActivity.id
      ),
    }));

    setIndicatorQuery((prevState) => {
      let tempActivities = { ...prevState.activities };
      if (tempActivities[selectedActivity.queryId]) {
        tempActivities[selectedActivity.queryId] = tempActivities[
          selectedActivity.queryId
        ].filter((name) => name !== selectedActivity.name);
        if (tempActivities[selectedActivity.queryId].length === 0) {
          delete tempActivities[selectedActivity.queryId];
        }
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

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
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
                  renderOption={(props, option) => {
                    const realIndex = state.activitiesList.findIndex(
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
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, mr: 1 }}>
                                {state.selectedActivitiesList.length} selected
                              </Typography>
                            </Box>
                          </li>
                        )}
                        <li {...props} style={{ display: "flex", alignItems: "center" }}>
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