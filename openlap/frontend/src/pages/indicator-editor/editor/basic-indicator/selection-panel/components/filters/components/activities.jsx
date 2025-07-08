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

  // Checkbox-Status prüfen
  const isChecked = (id) =>
    state.selectedActivitiesList.some((activity) => activity.id === id);

  // Checkbox-Handler
  const handleCheckboxChange = (option) => {
    if (isChecked(option.id)) {
      handleDeselectActivity(option);
    } else {
      handleSelectActivities(option);
    }
  };

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
    // eslint-disable-next-line
  }, [indicatorQuery.activityTypes.length]);

  const handleSelectActivities = (selectedActivity) => {
    setState((prevState) => ({
      ...prevState,
      selectedActivitiesList: [
        ...prevState.selectedActivitiesList,
        selectedActivity,
      ],
      autoCompleteValue: null,
    }));

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

  // Für "Alle auswählen"-Checkbox
  const allChecked =
    state.activitiesList.length > 0 &&
    state.activitiesList.every((option) => isChecked(option.id));
  const anyChecked =
    state.activitiesList.some((option) => isChecked(option.id));

  const handleSelectAll = () => {
    if (allChecked) {
      // Alle abwählen
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: [],
      }));
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activities: {},
      }));
    } else {
      // Alle auswählen
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: [...state.activitiesList],
      }));
      // Optional: Query-Update für alle Aktivitäten
      const tempActivities = {};
      state.activitiesList.forEach((activity) => {
        if (!tempActivities[activity.queryId]) tempActivities[activity.queryId] = [];
        if (!tempActivities[activity.queryId].includes(activity.name)) {
          tempActivities[activity.queryId].push(activity.name);
        }
      });
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activities: tempActivities,
      }));
    }
  };

  // Gruppierung nach Typ (ohne MUI groupBy!)
  const grouped = {};
  state.activitiesList.forEach((activity) => {
    const type = activity.activityType.split("/").pop() || "Unknown Type";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(activity);
  });

  // Sticky-Header als Option!
  const stickyHeaderOption = { sticky: true, id: "sticky-header" };
  const groupedFlatList = [
    stickyHeaderOption,
    ...Object.entries(grouped).flatMap(([type, items]) => [
      { header: true, type, id: `header-${type}` },
      ...items,
    ]),
  ];

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Search for Activities
              </Typography>
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
                  disabled={
                    indicatorQuery.activityTypes.length === 0 ||
                    state.selectedActionsList.length > 0
                  }
                  disablePortal
                  disableCloseOnSelect
                  id="combo-box-activities"
                  options={groupedFlatList}
                  groupBy={undefined}
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
                  getOptionLabel={(option) =>
                    option.header ? option.type : option.name || ""
                  }
                  ListboxComponent="ul"
                  renderOption={(props, option) => {
                    // Sticky-Header
                    if (option.sticky) {
                      // ref und tabIndex entfernen!
                      const { ref, tabIndex, ...restProps } = props;
                      return (
                        <li
                          {...restProps}
                          tabIndex={-1}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            background: "#fff",
                            borderBottom: "1px solid #eee",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            height: "40px",
                            paddingLeft: 16,
                          }}
                        >
                          <Checkbox
                            checked={allChecked}
                            indeterminate={anyChecked && !allChecked}
                            onChange={handleSelectAll}
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {state.selectedActivitiesList.length} selected
                          </Typography>
                        </li>
                      );
                    }
                    // Gruppen-Header
                    if (option.header) {
                      const { ref, tabIndex, ...restProps } = props;
                      return (
                        <li
                          {...restProps}
                          tabIndex={-1}
                          style={{
                            background: "#fff",
                            padding: "8px 16px",
                            fontWeight: "bold",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {option.type}
                        </li>
                      );
                    }
                    // Normale Einträge:
                    return (
                      <li
                        {...props}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          transition: "background 0.15s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f5f5f5")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <Checkbox
                          checked={isChecked(option.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(option);
                          }}
                          sx={{ mr: 1 }}
                        />
                        <Grid
                          container
                          sx={{ py: 0.5 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(option);
                          }}
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
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected <b>Activity(ies)</b>
              </Typography>
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
                        indicatorQuery.actionOnActivities.length ? (
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
                          indicatorQuery.actionOnActivities.length
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
              {indicatorQuery.actionOnActivities.length > 0 && (
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
