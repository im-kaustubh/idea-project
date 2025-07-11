import { useContext, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  Grid,
  TextField,
  Typography,
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

  const [options, setOptions] = useState([]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activitiesData = await fetchActivitiesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms,
          indicatorQuery.activityTypes
        );
        setOptions(activitiesData);
        setState((prevState) => ({
          ...prevState,
          activitiesList: activitiesData,
        }));
      } catch (error) {
        console.error("Failed to load Activities list", error);
      }
    };
    if (indicatorQuery.activityTypes.length > 0) {
      loadActivities();
    }
    // eslint-disable-next-line
  }, [indicatorQuery.activityTypes.length]);

  const isChecked = (id) =>
    state.selectedActivitiesList.some((activity) => activity.id === id);

  const handleSelectActivities = (selectedActivity) => {
    const alreadySelected = isChecked(selectedActivity.id);
    let newSelected;

    if (alreadySelected) {
      newSelected = state.selectedActivitiesList.filter(
        (item) => item.id !== selectedActivity.id
      );
    } else {
      newSelected = [...state.selectedActivitiesList, selectedActivity];
    }

    setState((prevState) => ({
      ...prevState,
      selectedActivitiesList: newSelected,
    }));

    // Update indicatorQuery
    const tempActivities = {};
    newSelected.forEach((activity) => {
      if (!tempActivities[activity.queryId]) tempActivities[activity.queryId] = [];
      if (!tempActivities[activity.queryId].includes(activity.name)) {
        tempActivities[activity.queryId].push(activity.name);
      }
    });

    setIndicatorQuery((prevState) => ({
      ...prevState,
      activities: tempActivities,
    }));

    const keys = Object.keys(tempActivities);
    setAnalysisInputMenu((prevState) => ({
      ...prevState,
      activities: {
        ...prevState.activities,
        id: keys.length === 1 ? keys[0] : undefined,
        options: keys,
      },
    }));

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  // Grouped Autocomplete config
  const groupedOptions = useMemo(() => {
    return options.map((opt) => ({
      ...opt,
      group: opt.activityType?.split("/").pop() || "Unknown",
    }));
  }, [options]);

  return (
    <Grid container spacing={4} sx={{ mb: 2 }}>
      <Grid item xs={12} md={4}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Search for Activities
        </Typography>
        <Autocomplete
          multiple
          options={groupedOptions.sort((a, b) =>
            a.group.localeCompare(b.group)
          )}
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.name}
          value={state.selectedActivitiesList}
          onChange={(event, newValue) => {
            setState((prev) => ({
              ...prev,
              selectedActivitiesList: newValue,
            }));

            // Update indicatorQuery
            const tempActivities = {};
            newValue.forEach((activity) => {
              if (!tempActivities[activity.queryId]) tempActivities[activity.queryId] = [];
              if (!tempActivities[activity.queryId].includes(activity.name)) {
                tempActivities[activity.queryId].push(activity.name);
              }
            });

            setIndicatorQuery((prevState) => ({
              ...prevState,
              activities: tempActivities,
            }));

            const keys = Object.keys(tempActivities);
            setAnalysisInputMenu((prevState) => ({
              ...prevState,
              activities: {
                ...prevState.activities,
                id: keys.length === 1 ? keys[0] : undefined,
                options: keys,
              },
            }));

            setAnalysisRef((prevState) => ({
              ...prevState,
              analyzedData: {},
            }));
          }}
          disableCloseOnSelect
          renderInput={(params) => (
            <TextField {...params} label="Select Activities" />
          )}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.name}
            </li>
          )}
          sx={{ width: "100%", maxHeight: 400 }}
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Selected <b>Activity(ies)</b>
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={1}>
            {state.selectedActivitiesList?.map((activity) => (
              <Grid item key={activity.id}>
                <Chip
                  color="primary"
                  label={activity.name}
                  onDelete={() => handleSelectActivities(activity)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Divider sx={{ mt: state.selectedActivitiesList.length > 0 ? 2 : 5 }} />
      </Grid>
    </Grid>
  );
};

export default Activities;
