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
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { AuthContext } from "../../../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { fetchActivitiesList } from "../utils/filters-api.js";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";
import { blue } from "@mui/material/colors";
import { useRef } from "react";

const Activities = ({ state, setState }) => {
  const { api } = useContext(AuthContext);
  const {
    setAnalysisRef,
    indicatorQuery,
    setIndicatorQuery,
    setAnalysisInputMenu,
  } = useContext(BasicIndicatorContext);

  // Gruppierung nach Typ
  const grouped = {};
  state.activitiesList.forEach((activity) => {
    const type = activity.activityType.split("/").pop() || "Unknown Type";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(activity);
  });
  const groupKeys = Object.keys(grouped);

  // State für geöffnete Gruppen
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(groupKeys.map((k) => [k, true]))
  );

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // State für ausgewählte Gruppe
  const [selectedGroup, setSelectedGroup] = useState(groupKeys[0] || "");

  // Filtered List nach ausgewählter Gruppe
  const filteredActivitiesList = selectedGroup ? grouped[selectedGroup] || [] : [];

  // Checkbox-Status prüfen
  const isChecked = (id) =>
    state.selectedActivitiesList.some((activity) => activity.id === id);

  // State für Shift-Range
  const [lastCheckedIndex, setLastCheckedIndex] = useState(null);

  // Flache Liste aller Aktivitäten (für Shift-Range)
  const flatActivityList = groupKeys.flatMap((group) =>
    grouped[group].map((activity) => ({ ...activity, group }))
  );

  // Checkbox-Handler mit Shift-Range
  const handleCheckboxChange = (option, event) => {
    const currentIndex = flatActivityList.findIndex((a) => a.id === option.id);

    if (event && event.shiftKey && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, currentIndex);
      const end = Math.max(lastCheckedIndex, currentIndex);
      const range = flatActivityList.slice(start, end + 1);

      let newSelected;
      if (isChecked(option.id)) {
        // Deselect range
        newSelected = state.selectedActivitiesList.filter(
          (item) => !range.some((r) => r.id === item.id)
        );
      } else {
        // Select range
        newSelected = [
          ...state.selectedActivitiesList,
          ...range.filter(
            (r) => !state.selectedActivitiesList.some((s) => s.id === r.id)
          ),
        ];
      }
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: newSelected,
      }));

      // Query-Update analog zu handleSelectAll
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

      setLastCheckedIndex(currentIndex);
    } else {
      if (isChecked(option.id)) {
        handleDeselectActivity(option);
      } else {
        handleSelectActivities(option);
      }
      setLastCheckedIndex(currentIndex);
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

  // Für "Alle auswählen"-Checkbox (über alle Gruppen)
  const allChecked =
    state.activitiesList.length > 0 &&
    state.activitiesList.every((option) => isChecked(option.id));
  const anyChecked =
    state.activitiesList.some((option) => isChecked(option.id));

  const handleSelectAll = () => {
    if (allChecked) {
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: [],
      }));
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activities: {},
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: [...state.activitiesList],
      }));
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

  // Checkbox für Gruppen (alle Aktivitäten dieser Gruppe)
  const isGroupChecked = (group) =>
    grouped[group].length > 0 &&
    grouped[group].every((activity) => isChecked(activity.id));
  const isGroupIndeterminate = (group) =>
    grouped[group].some((activity) => isChecked(activity.id)) &&
    !isGroupChecked(group);

  const handleGroupSelect = (group) => {
    const groupActivities = grouped[group];
    const allSelected = isGroupChecked(group);
    let newSelected;
    if (allSelected) {
      newSelected = state.selectedActivitiesList.filter(
        (activity) => !groupActivities.some((g) => g.id === activity.id)
      );
    } else {
      newSelected = [
        ...state.selectedActivitiesList,
        ...groupActivities.filter(
          (g) => !state.selectedActivitiesList.some((a) => a.id === g.id)
        ),
      ];
    }
    setState((prevState) => ({
      ...prevState,
      selectedActivitiesList: newSelected,
    }));
    // Query-Update analog zu handleSelectAll
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
  };

  useEffect(() => {
    // Wenn ein Activity Type entfernt wurde, entferne auch die zugehörigen Activities
    // Hole alle noch aktiven ActivityTypes (IDs)
    const activeActivityTypeIds = new Set(
      indicatorQuery.activityTypes || []
    );

    // Filtere alle Activities, deren activityType NICHT mehr aktiv ist
    const filteredSelectedActivities = state.selectedActivitiesList.filter(
      (activity) =>
        activeActivityTypeIds.has(
          activity.activityType
        )
    );

    // Wenn sich etwas geändert hat, update State und Query
    if (filteredSelectedActivities.length !== state.selectedActivitiesList.length) {
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: filteredSelectedActivities,
      }));

      // Auch Query anpassen
      const tempActivities = {};
      filteredSelectedActivities.forEach((activity) => {
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
  }, [indicatorQuery.activityTypes, setState, setIndicatorQuery, state.selectedActivitiesList]);

  return (
    <Grid container spacing={4} sx={{ mb: 2 }}>
      <Grid item xs={12} md={4}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Search for Activities
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                maxHeight: 320,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: 1,
                background: "#fff",
                p: 1,
              }}
            >
              {/* Sticky Header für "Alle auswählen" */}
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  background: "#fff",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  height: "40px",
                  px: 1,
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
              </Box>
              {/* Gruppen mit blauem Balken, Checkbox und Pfeil rechts */}
              {groupKeys.map((group) => (
                <Box key={group}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      py: 1,
                      px: 2,
                      background: blue[50],
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                    onClick={() => toggleGroup(group)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        checked={isGroupChecked(group)}
                        indeterminate={isGroupIndeterminate(group)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupSelect(group);
                        }}
                        sx={{ mr: 1 }}
                      />
                      <Typography sx={{ fontWeight: "bold" }}>{group}</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(group);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {openGroups[group] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  {openGroups[group] &&
                    grouped[group].map((option) => (
                      <Box
                        key={option.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          pl: 5,
                          py: 0.5,
                        }}
                      >
                        <Checkbox
                          checked={isChecked(option.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(option, e);
                          }}
                          sx={{ mr: 1 }}
                        />
                        <Typography>{option.name}</Typography>
                      </Box>
                    ))}
                </Box>
              ))}
            </Box>
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
                  <Chip
                    color="primary"
                    label={activity.name}
                    onDelete={() => handleDeselectActivity(activity)}
                  />
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
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Activities;
