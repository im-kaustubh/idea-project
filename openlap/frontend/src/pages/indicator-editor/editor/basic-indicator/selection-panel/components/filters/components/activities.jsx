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
  // Get API and context functions
  const { api } = useContext(AuthContext);
  const {
    setAnalysisRef,
    indicatorQuery,
    setIndicatorQuery,
    setAnalysisInputMenu,
    handleTourProgress,
  } = useContext(BasicIndicatorContext);

  // Filter activities to only show those from selected activity types
  const filteredActivitiesByType = state.activitiesList.filter((activity) =>
    indicatorQuery.activityTypes.includes(activity.activityType)
  );

  // Group filtered activities by the display name (last part of activityType)
  // Remove duplicates based on activity ID to ensure each activity appears only once
  const grouped = {};
  const seenActivityIds = new Set();
  
  filteredActivitiesByType.forEach((activity) => {
    // Skip if we've already seen this activity ID
    if (seenActivityIds.has(activity.id)) {
      return;
    }
    seenActivityIds.add(activity.id);
    
    const type = activity.activityType.split("/").pop() || "Unknown Type";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(activity);
  });
  const groupKeys = Object.keys(grouped);

  // Create a flat list for the autocomplete that maintains the grouping information
  const flattenedOptions = [];
  flattenedOptions.push('__ALL__'); // Add the "Select All" option first
  
  // Add activities from each group, ensuring each activity knows its proper group
  groupKeys.forEach(groupName => {
    grouped[groupName].forEach(activity => {
      // Ensure each activity has the correct group name for rendering
      flattenedOptions.push({
        ...activity,
        displayGroup: groupName
      });
    });
  });

  // State for tracking which groups are expanded/collapsed
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(groupKeys.map((k) => [k, true]))
  );

  // Toggle group expand/collapse state
  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // State for currently selected group
  const [selectedGroup, setSelectedGroup] = useState(groupKeys[0] || "");

  // Filter activities based on selected group
  const filteredActivitiesList = selectedGroup ? grouped[selectedGroup] || [] : [];

  // Check if an activity is currently selected
  const isChecked = (id) =>
    state.selectedActivitiesList.some((activity) => activity.id === id);

  // State for shift-click range selection
  const [lastCheckedIndex, setLastCheckedIndex] = useState(null);

  // Flatten activities list for range selection functionality
  const flatActivityList = groupKeys.flatMap((group) =>
    grouped[group].map((activity) => ({ ...activity, group }))
  );

  // Handle checkbox changes with support for shift-click range selection
  const handleCheckboxChange = (option, event) => {
    const currentIndex = flatActivityList.findIndex((a) => a.id === option.id);

    // Handle shift-click for range selection
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

      // Update query with selected activities
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

      // Trigger tour progression after state update
      if (handleTourProgress) {
        setTimeout(() => handleTourProgress(), 50);
      }

      setLastCheckedIndex(currentIndex);
    } else {
      // Handle single click selection/deselection
      if (isChecked(option.id)) {
        handleDeselectActivity(option);
      } else {
        handleSelectActivities(option);
      }
      setLastCheckedIndex(currentIndex);
    }
  };

  // Load activities data when activity types change
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

  // Handle selecting a single activity
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

    // Update indicator query with selected activity
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
      // Update analysis input menu with activity options
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

    // Trigger tour progression after state update
    if (handleTourProgress) {
      setTimeout(() => handleTourProgress(), 50);
    }
  };

  // Handle deselecting a single activity
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

    // Update indicator query by removing deselected activity
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

      // Clear analyzed data when selection changes
      setAnalysisRef((prevState) => ({
        ...prevState,
        analyzedData: {},
      }));

      let tempActivityKeys = Object.keys(tempActivities);
      // Update analysis input menu
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

  // Check states for "Select All" checkbox based on the flattened unique activities
  const uniqueActivities = flattenedOptions.filter(option => option !== '__ALL__');
  const allChecked =
    uniqueActivities.length > 0 &&
    uniqueActivities.every((option) => isChecked(option.id));
  const anyChecked =
    uniqueActivities.some((option) => isChecked(option.id));

  // Handle "Select All" / "Deselect All" functionality
  const handleSelectAll = () => {
    if (allChecked) {
      // Deselect all activities
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: [],
      }));
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activities: {},
      }));
    } else {
      // Select all activities from the unique flattened list
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: [...uniqueActivities],
      }));
      // Build activities query object
      const tempActivities = {};
      uniqueActivities.forEach((activity) => {
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

  // Check states for group-level checkboxes
  const isGroupChecked = (group) =>
    grouped[group].length > 0 &&
    grouped[group].every((activity) => isChecked(activity.id));
  const isGroupIndeterminate = (group) =>
    grouped[group].some((activity) => isChecked(activity.id)) &&
    !isGroupChecked(group);

  // Handle selecting/deselecting all activities in a group
  const handleGroupSelect = (group) => {
    const groupActivities = grouped[group];
    const allSelected = isGroupChecked(group);
    let newSelected;
    if (allSelected) {
      // Deselect all activities in this group
      newSelected = state.selectedActivitiesList.filter(
        (activity) => !groupActivities.some((g) => g.id === activity.id)
      );
    } else {
      // Select all activities in this group
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
    // Update query with new selection
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

  // Clean up selected activities when activity types are removed
  // Clean up selected activities when activity types are removed
  useEffect(() => {
    // Get all currently active activity type IDs
    const activeActivityTypeIds = new Set(
      indicatorQuery.activityTypes || []
    );

    // Filter selected activities to only include those with active activity types
    const filteredSelectedActivities = state.selectedActivitiesList.filter(
      (activity) =>
        activeActivityTypeIds.has(
          activity.activityType
        )
    );

    // Update state and query if anything changed
    if (filteredSelectedActivities.length !== state.selectedActivitiesList.length) {
      setState((prevState) => ({
        ...prevState,
        selectedActivitiesList: filteredSelectedActivities,
      }));

      // Update query to match filtered selection
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
      {/* Left column: Search and filter activities */}
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
                    Select at least one Activity Type to view the list of Activities.
                  </Typography>
                ) : undefined
              }
            >
              <Autocomplete
                className="shepherd-activity-selector"
                openOnFocus
                disablePortal
                disableCloseOnSelect
                disabled={indicatorQuery.activityTypes.length === 0}
                id="combo-box-activities"
                options={flattenedOptions}
                groupBy={(option) => option === '__ALL__' ? null : (option.displayGroup || "Unknown Type")}
                onOpen={() => {
                  // Collapse all groups when dropdown opens
                  setOpenGroups(Object.fromEntries(groupKeys.map((k) => [k, false])));
                }}
                renderGroup={(params) => {
                  // Special handling for sticky header (no grouping)
                  if (params.group === null) return params.children;
                  const group = params.group;
                  return (
                    <li key={params.key}>
                      {/* Group header with checkbox and expand/collapse button */}
                      <Box
                        sx={{ px: 2, py: 0.5, background: '#f5f5f5', borderRadius: 1, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', minHeight: 28 }}
                        onClick={() => toggleGroup(group)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={isGroupChecked(group)}
                            indeterminate={isGroupIndeterminate(group)}
                            onClick={e => {
                              e.stopPropagation();
                              handleGroupSelect(group);
                            }}
                            sx={{ mr: 1, p: 0.5 }}
                          />
                          <Typography sx={{ fontWeight: 'bold', fontSize: '0.97rem' }}>{group}</Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            toggleGroup(group);
                          }}
                          sx={{ ml: 1 }}
                        >
                          {openGroups[group] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      {/* Show group content only when expanded */}
                      {openGroups[group] && <ul style={{ paddingLeft: 0 }}>{params.children}</ul>}
                    </li>
                  );
                }}
                renderOption={(props, option, { selected }) => {
                  // Render sticky "Select All" header
                  if (option === '__ALL__') {
                    return (
                      <li {...props} style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        background: '#fff',
                        borderBottom: '1px solid #eee',
                        width: '100%',
                        margin: 0,
                        padding: 0,
                        left: 0,
                        right: 0,
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        height: '40px',
                        paddingLeft: 12
                      }}>
                        <Checkbox
                          checked={allChecked}
                          indeterminate={anyChecked && !allChecked}
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectAll();
                          }}
                          sx={{ ml: 0, mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, mr: 1 }}>
                          {state.selectedActivitiesList.length} selected
                        </Typography>
                      </li>
                    );
                  }
                  // Render individual activity options
                  const realIndex = flatActivityList.findIndex((a) => a.id === option.id);
                  return (
                    <li {...props} style={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={isChecked(option.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(option, e);
                        }}
                        sx={{ mr: 1 }}
                      />
                      <Grid
                        container
                        sx={{ py: 0.5 }}
                        onClick={(e) => handleCheckboxChange(option, e)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Grid item xs={12}>
                          <Typography>{option.name}</Typography>
                        </Grid>
                      </Grid>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="*Activities" />
                )}
                ListboxProps={{
                  style: {
                    maxHeight: '240px',
                    paddingTop: 0,
                    marginTop: 0,
                  },
                }}
              />
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      {/* Right column: Selected activities display */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected <b>Activity(ies)</b>
              </Typography>
              {/* Clear All button - only visible when activities are selected */}
              {state.selectedActivitiesList.length > 0 && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: blue[600], 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    '&:hover': { color: blue[800] }
                  }}
                  onClick={() => {
                    setState((prevState) => ({
                      ...prevState,
                      selectedActivitiesList: [],
                    }));
                    setIndicatorQuery((prevState) => ({
                      ...prevState,
                      activities: {},
                    }));
                  }}
                >
                  Clear All
                </Typography>
              )}
            </Box>
          </Grid>
          {/* Display selected activities as chips */}
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
          {/* Divider at bottom */}
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
