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
  Checkbox, //New import for Checkbox
} from "@mui/material";
import { AuthContext } from "../../../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { fetchActivityTypesList } from "../utils/filters-api.js";
import { getLastWordAndCapitalize } from "../../../utils/utils.js";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";

const ActivityTypes = ({ state, setState }) => {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false); //New, saves state of the list, open or closed?
  const [lastCheckedIndex, setLastCheckedIndex] = useState(null); //New, save the last checked list entry index
  const { api } = useContext(AuthContext);  
  const { indicatorQuery, setIndicatorQuery, setAnalysisRef } = useContext(BasicIndicatorContext);

  useEffect(() => {
    const loadActivityTypesData = async () => {
      try {
        const activityTypesData = await fetchActivityTypesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms
        );
        //Changed, Filter deleted, so list don't change after selection of checkbox, List is always visible
        setState((prevState) => ({
          ...prevState,
          activityTypesList: activityTypesData, 
        }));
        setLastCheckedIndex(null);
        //Changed
      } catch (error) {
        console.log("Failed to load Activity types list", error);
      }
    };

    if (indicatorQuery.platforms.length) {
      loadActivityTypesData();
    }
  }, [indicatorQuery.platforms.length]);

  // NEW, helps to check if a checkbox is checked or not, otherwise you should search everytime in the whole array
  const isChecked = (id) =>
    state.selectedActivityTypesList.some((type) => type.id === id);

  // NEW, Event handler for every checkbox change, to handle the shift key logic and the checkbox selection
  const handleCheckboxChange = (option, realIndex, event) => {

    // copy of the current states
    let newSelected = [...state.selectedActivityTypesList];
    let newActivityTypes = [...indicatorQuery.activityTypes];

    // shift logic for range selection, if shift is pressed a checkbox is clicked
    if (event && event.shiftKey && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, realIndex); //start index of the range
      const end = Math.max(lastCheckedIndex, realIndex);  //end index of the range
      const rangeOptions = state.activityTypesList.slice(start, end + 1); //safes the slice from start and end

      const shouldCheck = !isChecked(option.id); //do we need to uncheck or check the checkboxes, based on last checked

      // is shouldChecked true or false? Which Checkboxes are currently not clicked?
      if (shouldCheck) { //Range check, if shouldCheck is true
        rangeOptions.forEach((opt) => {
          if (!isChecked(opt.id)) { //is this checkbox already checked?
            newSelected.push(opt); //saved in newSelected
            newActivityTypes.push(opt.id); //saved in newActivityTypes
          }
        });
      } else { //Range uncheck
        newSelected = newSelected.filter(
          (type) => !rangeOptions.some((opt) => opt.id === type.id) //delete all currently selected checkboxes
        );
        newActivityTypes = newActivityTypes.filter( //delete all currently selected checkboxes
          (id) => !rangeOptions.some((opt) => opt.id === id)
        );
      }
      setLastCheckedIndex(realIndex); //saves index

      // normal checkbox click, without shift key
    } else {
      if (isChecked(option.id)) { //checkbox is already checked, needs to be deleted
        newSelected = newSelected.filter((type) => type.id !== option.id);
        newActivityTypes = newActivityTypes.filter((id) => id !== option.id);
      } else { //checkbox is unchecked, needs to be added
        newSelected.push(option);
        newActivityTypes.push(option.id);
      }
      setLastCheckedIndex(realIndex); //saves index
    }

    // Update the state with the new selections
    setState((prevState) => ({
      ...prevState,
      selectedActivityTypesList: newSelected,
    }));
    setIndicatorQuery((prevState) => ({
      ...prevState,
      activityTypes: newActivityTypes,
    }));
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  // NEW, Check if all checkboxes are checked or not
  const allChecked =
    state.activityTypesList.length > 0 &&
    state.activityTypesList.every((option) => isChecked(option.id));
  
  // NEW, Check if any checkbox is checked or not
  const anyChecked =
    state.activityTypesList.some((option) => isChecked(option.id));

  // NEW, Handle select all or deselect all checkboxes
  const handleSelectAll = () => {
    if (allChecked) { //delete all checkboxes, if all are selected
      setState((prevState) => ({ //filters for UI
        ...prevState,
        selectedActivityTypesList: prevState.selectedActivityTypesList.filter(
          (type) => !state.activityTypesList.some((opt) => opt.id === type.id)
        ),
      }));
      setIndicatorQuery((prevState) => ({ //filters for API
        ...prevState,
        activityTypes: prevState.activityTypes.filter(
          (id) => !state.activityTypesList.some((opt) => opt.id === id)
        ),
      }));
    } else { //select all checkboxes and update the state
      const newSelected = [
        ...state.selectedActivityTypesList, //current checked checkboxes
        ...state.activityTypesList.filter( //filter new checkboxes, which are not already selected
          (opt) => !state.selectedActivityTypesList.some((type) => type.id === opt.id)
        ),
      ];
      setState((prevState) => ({ //Update state with new selected checkboxes
        ...prevState,
        selectedActivityTypesList: newSelected,
      }));
      setIndicatorQuery((prevState) => ({ //Update API with new selected checkboxes
        ...prevState,
        activityTypes: [
          ...prevState.activityTypes,
          ...state.activityTypesList
            .map((opt) => opt.id)
            .filter((id) => !prevState.activityTypes.includes(id)),
        ],
      }));
    }
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

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
                  //NEW - because dropdown should not close when clicking on a checkbox
                  open={autocompleteOpen} //dropdown opens if true and closes if false
                  onOpen={() => setAutocompleteOpen(true)} //trigger by opening the dropdown
                  onClose={() => setAutocompleteOpen(false)} //trigger by closing the dropdown
                  disabled={indicatorQuery.platforms.length === 0} //deactivate the dropdown if no platform is selected
                  //NEW


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
                    return (  //NEW, Sticky Header with checkbox and counter of selected checkboxes
                      <>
                        {realIndex === 0 && (
                          <li
                            style={{ //sticky header style
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
                            <Box //Container for Checkbox and counter
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
                              <Checkbox //select all/ deselect all checkbox
                                checked={allChecked} //check if all checkboxes are checked
                                indeterminate={anyChecked && !allChecked} //"-" if some checkboxes are checked
                                onChange={handleSelectAll} //handle select all or deselect all
                                sx={{ ml: 2, mr: 1 }}
                                inputProps={{ "aria-label": "Alle auswählen" }} 
                              />
                              {/* selected counter */}
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, mr: 1 }}> 
                                {state.selectedActivityTypesList.length} selected 
                              </Typography> 
                            </Box> 
                          </li>
                        )}

                        
                        <li {...props} style={{ display: "flex", alignItems: "center" }}> 
                          <Checkbox //Checkbox for each activity type
                            checked={isChecked(option.id)}
                            onClick={(e) => handleCheckboxChange(option, realIndex, e)} // handle checkbox click
                            sx={{ mr: 1 }}
                          />
                          <Grid
                            container
                            sx={{ py: 0.5 }}
                            onClick={(e) => handleCheckboxChange(option, realIndex, e)} // handle for click on the list entry
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
                  Selected <b>Activity type(s)</b>
                </Typography>
              </Box>
            </Grid>
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