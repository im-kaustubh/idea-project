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
import React from "react";

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

  // Flache Liste mit Typ extrahiert
  const flatOptions = state.activitiesList.map((activity) => ({
    ...activity,
    type: activity.activityType?.split("/").pop() || "Unknown Type",
  }));

  // Checked-Status prüfen
  const isChecked = (id) =>
    state.selectedActivitiesList.some((activity) => activity.id === id);

  const allChecked =
    flatOptions.length > 0 && flatOptions.every((opt) => isChecked(opt.id));
  const anyChecked = flatOptions.some((opt) => isChecked(opt.id));

  // Auswahl im Query aktualisieren
  const updateIndicatorQueryActivities = (newSelectedList) => {
    let newActivities = {};
    newSelectedList.forEach((activity) => {
      if (!newActivities[activity.queryId]) {
        newActivities[activity.queryId] = [];
      }
      if (!newActivities[activity.queryId].includes(activity.name)) {
        newActivities[activity.queryId].push(activity.name);
      }
    });

    setIndicatorQuery((prev) => ({
      ...prev,
      activities: newActivities,
    }));

    const tempActivityKeys = Object.keys(newActivities);
    setAnalysisInputMenu((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        id: tempActivityKeys.length === 1 ? tempActivityKeys[0] : undefined,
        options: tempActivityKeys,
      },
    }));

    setAnalysisRef((prev) => ({ ...prev, analyzedData: {} }));
  };

  // Checkbox-Logik inkl. Shift-Select
  const handleCheckboxChange = (option, realIndex, event) => {
    let newSelected = [...state.selectedActivitiesList];

    if (event && event.shiftKey && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, realIndex);
      const end = Math.max(lastCheckedIndex, realIndex);
      const range = flatOptions.slice(start, end + 1);
      const shouldCheck = !isChecked(option.id);

      if (shouldCheck) {
        range.forEach((opt) => {
          if (!isChecked(opt.id)) {
            newSelected.push(opt);
          }
        });
      } else {
        newSelected = newSelected.filter(
          (item) => !range.some((opt) => opt.id === item.id)
        );
      }
    } else {
      if (isChecked(option.id)) {
        newSelected = newSelected.filter((item) => item.id !== option.id);
      } else {
        newSelected.push(option);
      }
    }

    setLastCheckedIndex(realIndex);
    setState((prev) => ({
      ...prev,
      selectedActivitiesList: newSelected,
    }));
    updateIndicatorQueryActivities(newSelected);
  };

  // Select All / Deselect All
  const handleSelectAll = () => {
    let newSelected;
    if (allChecked) {
      newSelected = state.selectedActivitiesList.filter(
        (item) => !flatOptions.some((opt) => opt.id === item.id)
      );
    } else {
      newSelected = [
        ...state.selectedActivitiesList,
        ...flatOptions.filter(
          (opt) => !state.selectedActivitiesList.some((item) => item.id === opt.id)
        ),
      ];
    }

    setState((prev) => ({
      ...prev,
      selectedActivitiesList: newSelected,
    }));
    updateIndicatorQueryActivities(newSelected);
  };

  // Einzelne Activity abwählen
  const handleDeselectActivity = (activity) => {
    const newSelected = state.selectedActivitiesList.filter(
      (item) => item.id !== activity.id
    );
    setState((prev) => ({
      ...prev,
      selectedActivitiesList: newSelected,
    }));
    updateIndicatorQueryActivities(newSelected);
  };

  // Daten laden
  useEffect(() => {
    const loadActivitiesData = async () => {
      try {
        const activitiesData = await fetchActivitiesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms,
          indicatorQuery.activityTypes
        );
        setState((prev) => ({
          ...prev,
          activitiesList: activitiesData,
        }));
        setLastCheckedIndex(null);
      } catch (error) {
        console.log("Failed to load Activities list", error);
      }
    };

    if (indicatorQuery.activityTypes.length > 0) {
      loadActivitiesData();
    }
  }, [indicatorQuery.activityTypes.length]);

  // Eigene Listbox-Komponente, die KEINEN Fokus setzt
  const NoScrollListbox = React.forwardRef(function NoScrollListbox(props, ref) {
    return (
      <ul ref={ref} {...props} tabIndex={-1} style={{ ...props.style, scrollBehavior: "auto" }}>
        {props.children}
      </ul>
    );
  });

  // Hilfsfunktion zum Gruppieren
  function groupByType(options) {
    const groups = {};
    options.forEach(opt => {
      const type = opt.type || "Unknown Type";
      if (!groups[type]) groups[type] = [];
      groups[type].push(opt);
    });
    return groups;
  }

  const groupedOptions = groupByType(flatOptions);
  const groupedFlatList = Object.entries(groupedOptions).flatMap(([type, items]) => [
    { header: true, type, id: `header-${type}` },
    ...items,
  ]);

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
                      Select at least one Activity Type from above to view the list of Activities.
                    </Typography>
                  ) : state.selectedActionsList?.length > 0 ? (
                    <Typography variant="body2">
                      Deselect all the Actions below in order to remove an activity.
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
                    state.selectedActionsList?.length > 0
                  }
                  disablePortal
                  disableCloseOnSelect
                  autoHighlight={false}
                  autoSelect={false}
                  id="combo-box-activities"
                  options={groupedFlatList}
                  groupBy={undefined} // <--- KEIN echtes Grouping!
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
                  getOptionLabel={option => option.header ? option.type : option.name}
                  renderOption={(props, option) => {
                    if (option.header) {
                      return (
                        <li
                          {...props}
                          style={{
                            background: '#fff',
                            padding: '8px 16px',
                            fontWeight: 'bold',
                            borderBottom: '1px solid #eee'
                          }}
                        >
                          {option.type}
                        </li>
                      );
                    }
                    const realIndex = flatOptions.findIndex(o => o.id === option.id);
                    return (
                      <li
                        {...props}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          transition: "background 0.15s",
                          cursor: "pointer",
                          ...(props['aria-selected']
                            ? { backgroundColor: "#f5f5f5" }
                            : {}),
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
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
                            <Typography>{option.name}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2">{option.id}</Typography>
                          </Grid>
                        </Grid>
                      </li>
                    );
                  }}
                  ListboxComponent={(props) => (
                    <ul {...props}>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                          background: '#fff',
                          borderBottom: '1px solid #eee',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          height: '40px',
                        }}
                      >
                        <Checkbox
                          checked={allChecked}
                          indeterminate={anyChecked && !allChecked}
                          onChange={handleSelectAll}
                          sx={{ ml: 2, mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, mr: 1 }}>
                          {state.selectedActivitiesList.length} selected
                        </Typography>
                      </Box>
                      {props.children}
                    </ul>
                  )}
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
                            Deselect all the Actions below in order to remove an activity.
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