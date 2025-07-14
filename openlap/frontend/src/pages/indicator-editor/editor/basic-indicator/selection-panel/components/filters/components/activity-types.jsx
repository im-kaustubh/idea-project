import { useContext, useEffect, useState } from "react";
import { Box } from "@mui/material";
import {
  Autocomplete,
  Chip,
  Divider,
  Grid,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
} from "@mui/material";
import { AuthContext } from "../../../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { fetchActivityTypesList } from "../utils/filters-api.js";
import { getLastWordAndCapitalize } from "../../../utils/utils.js";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";

const ActivityTypes = ({ state, setState }) => {
  // State for managing autocomplete dropdown visibility
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  // State for shift-click range selection
  const [lastCheckedIndex, setLastCheckedIndex] = useState(null);
  
  // Get API and context functions
  const { api } = useContext(AuthContext);
  const { indicatorQuery, setIndicatorQuery, setAnalysisRef, handleTourProgress } = useContext(BasicIndicatorContext);

  // Load activity types data when platforms change
  // Load activity types data when platforms change
  useEffect(() => {
    const loadActivityTypesData = async () => {
      try {
        const activityTypesData = await fetchActivityTypesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms
        );
        setState((prevState) => ({
          ...prevState,
          activityTypesList: activityTypesData,
        }));
        // Reset range selection when data changes
        setLastCheckedIndex(null);
      } catch (error) {
        console.log("Failed to load Activity types list", error);
      }
    };

    if (indicatorQuery.platforms.length) {
      loadActivityTypesData();
    }
  }, [indicatorQuery.platforms.length]);

  // Check if an activity type is currently selected
  const isChecked = (id) =>
    state.selectedActivityTypesList.some((type) => type.id === id);

  // Handle checkbox changes with support for shift-click range selection
  // Handle checkbox changes with support for shift-click range selection
  const handleCheckboxChange = (option, realIndex, event) => {
    let newSelected = [...state.selectedActivityTypesList];
    let newActivityTypes = [...indicatorQuery.activityTypes];

    // Handle shift-click for range selection
    if (event && event.shiftKey && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, realIndex);
      const end = Math.max(lastCheckedIndex, realIndex);
      const rangeOptions = state.activityTypesList.slice(start, end + 1);

      const shouldCheck = !isChecked(option.id);

      if (shouldCheck) {
        // Select all items in range
        rangeOptions.forEach((opt) => {
          if (!isChecked(opt.id)) {
            newSelected.push(opt);
            newActivityTypes.push(opt.id);
          }
        });
      } else {
        // Deselect all items in range
        newSelected = newSelected.filter(
          (type) => !rangeOptions.some((opt) => opt.id === type.id)
        );
        newActivityTypes = newActivityTypes.filter(
          (id) => !rangeOptions.some((opt) => opt.id === id)
        );
      }
      setLastCheckedIndex(realIndex);
    } else {
      // Handle single click selection/deselection
      if (isChecked(option.id)) {
        newSelected = newSelected.filter((type) => type.id !== option.id);
        newActivityTypes = newActivityTypes.filter((id) => id !== option.id);
      } else {
        newSelected.push(option);
        newActivityTypes.push(option.id);
      }
      setLastCheckedIndex(realIndex);
    }

    // Update state and query with new selection
    setState((prevState) => ({
      ...prevState,
      selectedActivityTypesList: newSelected,
    }));
    setIndicatorQuery((prevState) => ({
      ...prevState,
      activityTypes: newActivityTypes,
    }));
    // Clear analyzed data when selection changes
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Trigger tour progression after state update
    if (handleTourProgress) {
      setTimeout(() => handleTourProgress(), 50);
    }
  };

  // Check states for "Select All" checkbox
  const allChecked =
    state.activityTypesList.length > 0 &&
    state.activityTypesList.every((option) => isChecked(option.id));

  const anyChecked =
    state.activityTypesList.some((option) => isChecked(option.id));

  // Handle "Select All" / "Deselect All" functionality
  // Handle "Select All" / "Deselect All" functionality
  const handleSelectAll = () => {
    if (allChecked) {
      // Deselect all activity types
      setState((prevState) => ({
        ...prevState,
        selectedActivityTypesList: prevState.selectedActivityTypesList.filter(
          (type) => !state.activityTypesList.some((opt) => opt.id === type.id)
        ),
      }));
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activityTypes: prevState.activityTypes.filter(
          (id) => !state.activityTypesList.some((opt) => opt.id === id)
        ),
      }));
    } else {
      // Select all activity types
      const newSelected = [
        ...state.selectedActivityTypesList,
        ...state.activityTypesList.filter(
          (opt) => !state.selectedActivityTypesList.some((type) => type.id === opt.id)
        ),
      ];
      setState((prevState) => ({
        ...prevState,
        selectedActivityTypesList: newSelected,
      }));
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activityTypes: [
          ...prevState.activityTypes,
          ...state.activityTypesList
            .map((opt) => opt.id)
            .filter((id) => !prevState.activityTypes.includes(id)),
        ],
      }));
    }
    // Clear analyzed data when selection changes
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    // Trigger tour progression after state update
    if (handleTourProgress) {
      setTimeout(() => handleTourProgress(), 50);
    }
  };

  // Handle deselecting a single activity type
  // Handle deselecting a single activity type
  const handleDeselectActivityTypes = (selectedActivityType) => {
    setState((prevState) => ({
      ...prevState,
      selectedActivityTypesList: prevState.selectedActivityTypesList.filter(
        (type) => type.id !== selectedActivityType.id
      ),
    }));
    setIndicatorQuery((prevState) => ({
      ...prevState,
      activityTypes: prevState.activityTypes.filter(
        (id) => id !== selectedActivityType.id
      ),
    }));
    // Clear analyzed data when selection changes
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 2 }}>
        {/* Left column: Search and filter activity types */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Search for Activity types
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Tooltip
                arrow
                title={
                  indicatorQuery.platforms.length === 0 ? (
                    <Typography variant="body2">
                      Select at least one Platform from Dataset to view the list
                      of Activity types.
                    </Typography>
                  ) : undefined
                }
              >
                <Autocomplete
                  className="shepherd-activity-type-selector"
                  open={autocompleteOpen}
                  onOpen={() => setAutocompleteOpen(true)}
                  onClose={() => setAutocompleteOpen(false)}
                  disabled={indicatorQuery.platforms.length === 0}
                  disablePortal
                  disableCloseOnSelect
                  id="combo-box-lrs"
                  options={state.activityTypesList}
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
                    const realIndex = state.activityTypesList.findIndex(
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
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, mr: 1 }}>
                                {state.selectedActivityTypesList.length} selected
                              </Typography>
                            </Box>
                          </li>
                        )}
                        {/* Render individual activity type options */}
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
                    <TextField {...params} placeholder="*Activity types" />
                  )}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        {/* Right column: Selected activity types display */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  Selected <b>Activity type(s)</b>
                </Typography>
                {/* Clear All button - only visible when activity types are selected */}
                {state.selectedActivityTypesList.length > 0 && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#1976d2', 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      '&:hover': { color: '#1565c0' }
                    }}
                    onClick={() => {
                      setState((prevState) => ({
                        ...prevState,
                        selectedActivityTypesList: [],
                      }));
                      setIndicatorQuery((prevState) => ({
                        ...prevState,
                        activityTypes: [],
                      }));
                      setAnalysisRef((prevState) => ({
                        ...prevState,
                        analyzedData: {},
                      }));
                    }}
                  >
                    Clear All
                  </Typography>
                )}
              </Box>
            </Grid>
            {/* Display selected activity types as chips */}
            <Grid
              item
              xs={12}
              sx={{ mt: state.selectedActivityTypesList.length > 0 ? 1 : 0 }}
            >
              <Grid container spacing={1}>
                {state.selectedActivityTypesList?.map((activityType, index) => (
                  <Grid item key={index}>
                    <Chip
                      color="primary"
                      label={getLastWordAndCapitalize(activityType.name)}
                      onDelete={() => handleDeselectActivityTypes(activityType)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            {/* Divider at bottom */}
            <Grid
              item
              xs={12}
              sx={{ mt: state.selectedActivityTypesList.length > 0 ? 0.5 : 5.5 }}
            >
              <Divider />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ActivityTypes;