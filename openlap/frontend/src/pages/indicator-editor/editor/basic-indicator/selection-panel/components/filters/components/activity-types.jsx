import { useContext, useEffect, useState } from "react"; // geändert: useState importiert
import { Box } from "@mui/material"; // geändert: Box importiert
import {
  Autocomplete,
  Chip,
  Divider,
  Grid,
  TextField,//irgendwas
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

    setAnalysisRef((prevState) => ({ // geändert
      ...prevState,
      analyzedData: {},
    })); // geändert

    setIndicatorQuery((prevState) => { // geändert
      let tempActivityTypes = [
        ...prevState.activityTypes,
        ...selectedIds.filter(
          (id) => !prevState.activityTypes.includes(id)
        ),
      ];
      return {
        ...prevState,
        activityTypes: tempActivityTypes,
      };
    }); // geändert

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
                {/* Entfernt: Apply Button über der Liste */}
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
                  open={autocompleteOpen}
                  onOpen={() => setAutocompleteOpen(true)}
                  onClose={() => setAutocompleteOpen(false)}
                  disabled={indicatorQuery.platforms.length === 0} // <--- geändert
                  disablePortal
                  disableCloseOnSelect
                  id="combo-box-lrs"
                  options={state.activityTypesList}
                  fullWidth
                  slotProps={{
                    listbox: {
                      style: {
                        maxHeight: "240px",
                        paddingTop: 0, // <--- wichtig!
                        marginTop: 0,  // <--- optional, falls margin gesetzt ist
                      },
                    },
                  }}
                  getOptionLabel={(option) => option.name}
                  renderOption={(props, option, { index }) => {
                    const { key, ...restProps } = props;
                    const label = { inputProps: { "aria-label": option.name } };
                    // Sticky Header nur am Anfang der Liste einfügen
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
                                  areAllChecked ? handleDeselectAllCheckboxes() : handleSelectAllCheckboxes();
                                }}
                                sx={{ ml: 2, mr: 1 }}
                                inputProps={{ "aria-label": "Alle auswählen" }}
                              />
                              {/* Anzahl der ausgewählten Einträge */}
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, mr: 1 }}>
                                {Object.values(pendingCheckedOptions).filter(Boolean).length} selected
                              </Typography>
                              <Box sx={{ flexGrow: 1 }} />
                              {isAnyChecked && (
                                <Button
                                  sx={{ mr: 2, minWidth: 0, px: 2, height: 32 }}
                                  variant="contained"
                                  size="small"
                                  color="primary" // <-- statt "success" jetzt "primary" für blau
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
                {state.selectedActivityTypesList.length > 0 && (
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
                    onClick={handleDeleteAllSelected}
                  >
                    delete all
                  </Typography>
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
                      onDelete={() => handleDeselectActivityTypes(activityType)} // <--- geändert
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