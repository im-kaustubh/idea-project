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
  Button,
} from "@mui/material";
import { AuthContext } from "../../../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { fetchActivityTypesList } from "../utils/filters-api.js";
import { getLastWordAndCapitalize } from "../../../utils/utils.js";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";

const ActivityTypes = ({ state, setState }) => {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const { api } = useContext(AuthContext);
  const { indicatorQuery, setIndicatorQuery, setAnalysisRef } = useContext(
    BasicIndicatorContext
  );

  // Lade immer die vollständige Liste, unabhängig von Auswahl
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
      } catch (error) {
        console.log("Failed to load Activity types list", error);
      }
    };

    if (indicatorQuery.platforms.length) {
      loadActivityTypesData();
    }
  }, [indicatorQuery.platforms.length]);

  // Hilfsfunktion: Ist der Typ ausgewählt?
  const isChecked = (id) =>
    state.selectedActivityTypesList.some((type) => type.id === id);

  // Checkbox-Handler: Direktes Hinzufügen/Entfernen
  const handleCheckboxChange = (option) => {
    if (isChecked(option.id)) {
      // Entfernen
      setState((prevState) => ({
        ...prevState,
        selectedActivityTypesList: prevState.selectedActivityTypesList.filter(
          (type) => type.id !== option.id
        ),
      }));
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activityTypes: prevState.activityTypes.filter((id) => id !== option.id),
      }));
    } else {
      // Hinzufügen
      setState((prevState) => ({
        ...prevState,
        selectedActivityTypesList: [
          ...prevState.selectedActivityTypesList,
          option,
        ],
      }));
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activityTypes: [...prevState.activityTypes, option.id],
      }));
    }
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  // Sticky Header Logik
  const allChecked =
    state.activityTypesList.length > 0 &&
    state.activityTypesList.every((option) => isChecked(option.id));
  const anyChecked =
    state.activityTypesList.some((option) => isChecked(option.id));

  const handleSelectAll = () => {
    if (allChecked) {
      // Alle abwählen
      setState((prevState) => ({
        ...prevState,
        selectedActivityTypesList: prevState.selectedActivityTypesList.filter(
          (type) =>
            !state.activityTypesList.some((opt) => opt.id === type.id)
        ),
      }));
      setIndicatorQuery((prevState) => ({
        ...prevState,
        activityTypes: prevState.activityTypes.filter(
          (id) => !state.activityTypesList.some((opt) => opt.id === id)
        ),
      }));
    } else {
      // Alle auswählen
      const newSelected = [
        ...state.selectedActivityTypesList,
        ...state.activityTypesList.filter(
          (opt) =>
            !state.selectedActivityTypesList.some((type) => type.id === opt.id)
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
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  // Einzelnes Entfernen per Chip
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

  // Alle entfernen
  const handleDeleteAllSelected = () => {
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
                  renderOption={(props, option, { index }) => (
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
                      <li {...props} style={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          checked={isChecked(option.id)}
                          onChange={() => handleCheckboxChange(option)}
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
                  )}
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
                {/* delete all Button wurde entfernt */}
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