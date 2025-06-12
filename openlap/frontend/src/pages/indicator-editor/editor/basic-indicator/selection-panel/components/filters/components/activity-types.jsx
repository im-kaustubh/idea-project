import { useContext, useEffect, useState } from "react"; // geändert: useState importiert
import { Box } from "@mui/material"; // geändert: Box importiert
import {
  Autocomplete,
  Chip,
  Divider,
  Grid,
  TextField,
  Tooltip,
  Typography,
  Checkbox, // geändert: Checkbox importiert
  Button,   // geändert: Button importiert
} from "@mui/material";
import { AuthContext } from "../../../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { fetchActivityTypesList } from "../utils/filters-api.js";
import { getLastWordAndCapitalize } from "../../../utils/utils.js";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";

const ActivityTypes = ({ state, setState }) => {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false); // geändert: autocompleteOpen State hinzugefügt
  const [pendingCheckedOptions, setPendingCheckedOptions] = useState({}); // geändert: Checkbox State hinzugefügt
  const { api } = useContext(AuthContext);
  const { indicatorQuery, setIndicatorQuery, setAnalysisRef } = useContext(
    BasicIndicatorContext
  );

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
          activityTypesList: activityTypesData.filter(
            (activityType) =>
              !prevState.selectedActivityTypesList.some((t) => t.id === activityType.id) // geändert: .some statt .includes
          ),
        }));
      } catch (error) {
        console.log("Failed to load Activity types list", error);
      }
    };

    if (indicatorQuery.platforms.length) {
      loadActivityTypesData();
    }
  }, [indicatorQuery.platforms.length]);

  const handleCheckboxChange = (id) => { // geändert: Checkbox Handler hinzugefügt
    setPendingCheckedOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllCheckboxes = () => { // geändert: Select All Handler hinzugefügt
    const allChecked = {};
    state.activityTypesList.forEach((option) => {
      allChecked[option.id] = true;
    });
    setPendingCheckedOptions(allChecked);
  };

  const handleDeselectAllCheckboxes = () => { // geändert: Deselect All Handler hinzugefügt
    setPendingCheckedOptions({});
  };

  const areAllChecked =
    state.activityTypesList.length > 0 &&
    state.activityTypesList.every((option) => pendingCheckedOptions[option.id]); // geändert: Checkbox-Logik

  const isAnyChecked = Object.values(pendingCheckedOptions).some(Boolean); // geändert: Checkbox-Logik

  const handleApplyChecked = () => { // geändert: Apply Handler hinzugefügt
    const selectedIds = Object.entries(pendingCheckedOptions)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);

    const selectedTypes = state.activityTypesList.filter((type) =>
      selectedIds.includes(type.id)
    );

    setState((prevState) => ({
      ...prevState,
      selectedActivityTypesList: [
        ...prevState.selectedActivityTypesList,
        ...selectedTypes.filter(
          (type) =>
            !prevState.selectedActivityTypesList.some((t) => t.id === type.id)
        ),
      ],
      activityTypesList: prevState.activityTypesList.filter(
        (type) => !selectedIds.includes(type.id)
      ),
    }));
    setPendingCheckedOptions({});
  };

  const handleSelectActivityTypes = (selectedActivityType) => {
    setState((prevState) => ({
      ...prevState,
      activityTypesList: prevState.activityTypesList.filter(
        (item) => item.id !== selectedActivityType.id
      ),
      selectedActivityTypesList: [
        ...prevState.selectedActivityTypesList,
        selectedActivityType,
      ],
      autoCompleteValue: null,
    }));

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    setIndicatorQuery((prevState) => {
      let tempActivityTypes = [
        ...prevState.activityTypes,
        selectedActivityType.id,
      ];
      return {
        ...prevState,
        activityTypes: tempActivityTypes,
      };
    });
  };

  const handleDeselectActivityTypes = (selectedActivityType) => {
    setState((prevState) => {
      return {
        ...prevState,
        activityTypesList: [
          ...prevState.activityTypesList,
          selectedActivityType,
        ].sort((a, b) => a.name.localeCompare(b.name)),
        selectedActivityTypesList: prevState.selectedActivityTypesList.filter(
          (type) => type.id !== selectedActivityType.id
        ),
        autoCompleteValue: null,
      };
    });

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    setIndicatorQuery((prevState) => {
      return {
        ...prevState,
        activityTypes: prevState.activityTypes.filter(
          (item) => item !== selectedActivityType.id
        ),
      };
    });
  };

  // Delete all selected Activity Types
  const handleDeleteAllSelected = () => { // geändert: Delete All Handler hinzugefügt
    setState((prevState) => ({
      ...prevState,
      activityTypesList: [
        ...prevState.activityTypesList,
        ...prevState.selectedActivityTypesList,
      ].sort((a, b) => a.name.localeCompare(b.name)),
      selectedActivityTypesList: [],
    }));
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
    setIndicatorQuery((prevState) => ({
      ...prevState,
      activityTypes: [],
    }));
  };

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center"> {/* geändert: Box für Buttons */}
                <Typography variant="body2" color="text.secondary">
                  Search for Activity types
                </Typography>
                {state.activityTypesList.length > 0 && ( // geändert: Buttons nur wenn Liste nicht leer
                  <>
                    <Button
                      sx={{ ml: 1, visibility: autocompleteOpen ? "visible" : "hidden" }}
                      variant="contained"
                      size="small"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={
                        areAllChecked
                          ? handleDeselectAllCheckboxes
                          : handleSelectAllCheckboxes
                      }
                    >
                      {areAllChecked ? "deselect all" : "select all"}
                    </Button>
                    {isAnyChecked && (
                      <Button
                        sx={{ ml: 1, visibility: autocompleteOpen ? "visible" : "hidden" }}
                        variant="contained"
                        size="small"
                        color="success"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleApplyChecked}
                      >
                        Apply
                      </Button>
                    )}
                  </>
                )}
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
                  open={autocompleteOpen} // geändert: Autocomplete open/close
                  onOpen={() => setAutocompleteOpen(true)} // geändert
                  onClose={() => setAutocompleteOpen(false)} // geändert
                  disabled={
                    indicatorQuery.platforms.length === 0 ||
                    state.selectedActivitiesList.length > 0
                  }
                  disablePortal
                  disableCloseOnSelect
                  id="combo-box-lrs"
                  options={state.activityTypesList}
                  fullWidth
                  slotProps={{
                    listbox: {
                      style: {
                        maxHeight: "240px",
                      },
                    },
                  }}
                  getOptionLabel={(option) => option.name}
                  renderOption={(props, option) => { // geändert: Checkbox in Option
                    const { key, ...restProps } = props;
                    const label = { inputProps: { "aria-label": option.name } };
                    return (
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
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="*Activity types" />
                  )}
                  onChange={(event, value) => {
                    if (value) handleSelectActivityTypes(value);
                  }}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="flex-start"> {/* geändert: Box für Button */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mr: 1 }}
                >
                  Selected <b>Activity type(s)</b>
                </Typography>
                {state.selectedActivityTypesList.length > 0 && ( // geändert: Delete All Button
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={handleDeleteAllSelected}
                    sx={{ minWidth: 0, px: 2, ml: 1 }}
                  >
                    delete all
                  </Button>
                )}
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
                      onDelete={
                        Object.keys(indicatorQuery.activities).length
                          ? undefined
                          : () => handleDeselectActivityTypes(activityType)
                      }
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
            <Grid item xs={12}>
              {Object.keys(indicatorQuery.activities).length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  <i>
                    Remove all the <b>Activities</b> below to add/remove
                    activity types
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

export default ActivityTypes;