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

/**
 * ActivityTypes-Komponente für die Auswahl und Verwaltung von Aktivitätstypen
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.state - Zustandsobjekt der Elternkomponente
 * @param {Function} props.setState - Zustands-Update-Funktion der Elternkomponente
 */
const ActivityTypes = ({ state, setState }) => {
  // Zustand für das Öffnen/Schließen des Autocomplete-Dropdowns
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  
  // Zustand für den Index der zuletzt ausgewählten Checkbox (für Shift-Klick-Funktionalität)
  const [lastCheckedIndex, setLastCheckedIndex] = useState(null);
  
  // Kontexte für Authentifizierung und globale Filter
  const { api } = useContext(AuthContext);
  const { indicatorQuery, setIndicatorQuery, setAnalysisRef } = useContext(BasicIndicatorContext);

  /**
   * Effekt-Hook zum Laden der Aktivitätstypen-Liste bei Änderung der ausgewählten Plattformen
   */
  useEffect(() => {
    const loadActivityTypesData = async () => {
      try {
        // API-Aufruf zum Abrufen der Aktivitätstypen basierend auf ausgewählten Plattformen
        const activityTypesData = await fetchActivityTypesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms
        );
        
        // Aktualisiere den Zustand mit den neuen Aktivitätstypen
        setState((prevState) => ({
          ...prevState,
          activityTypesList: activityTypesData,
        }));
        
        // Zurücksetzen des letzten ausgewählten Index
        setLastCheckedIndex(null);
      } catch (error) {
        console.log("Failed to load Activity types list", error);
      }
    };

    // Nur laden, wenn mindestens eine Plattform ausgewählt ist
    if (indicatorQuery.platforms.length) {
      loadActivityTypesData();
    }
  }, [indicatorQuery.platforms.length]);

  /**
   * Überprüft, ob ein bestimmter Aktivitätstyp bereits ausgewählt ist
   * @param {string} id - ID des Aktivitätstyps
   * @returns {boolean} - true wenn ausgewählt, sonst false
   */
  const isChecked = (id) =>
    state.selectedActivityTypesList.some((type) => type.id === id);

  /**
   * Handler für Checkbox-Änderungen (inkl. Shift-Klick-Funktionalität für Bereichsauswahl)
   * @param {Object} option - Der ausgewählte Aktivitätstyp
   * @param {number} realIndex - Der tatsächliche Index in der Liste
   * @param {Object} event - Das auslösende Event-Objekt
   */
  const handleCheckboxChange = (option, realIndex, event) => {
    let newSelected = [...state.selectedActivityTypesList];
    let newActivityTypes = [...indicatorQuery.activityTypes];

    // Shift-Klick Logik für Bereichsauswahl
    if (event && event.shiftKey && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, realIndex);
      const end = Math.max(lastCheckedIndex, realIndex);
      const rangeOptions = state.activityTypesList.slice(start, end + 1);

      const shouldCheck = !isChecked(option.id);

      if (shouldCheck) {
        // Alle Optionen im Bereich auswählen
        rangeOptions.forEach((opt) => {
          if (!isChecked(opt.id)) {
            newSelected.push(opt);
            newActivityTypes.push(opt.id);
          }
        });
      } else {
        // Alle Optionen im Bereich abwählen
        newSelected = newSelected.filter(
          (type) => !rangeOptions.some((opt) => opt.id === type.id)
        );
        newActivityTypes = newActivityTypes.filter(
          (id) => !rangeOptions.some((opt) => opt.id === id)
        );
      }
      setLastCheckedIndex(realIndex);
    } else {
      // Einzelne Checkbox umschalten
      if (isChecked(option.id)) {
        // Entfernen wenn bereits ausgewählt
        newSelected = newSelected.filter((type) => type.id !== option.id);
        newActivityTypes = newActivityTypes.filter((id) => id !== option.id);
      } else {
        // Hinzufügen wenn nicht ausgewählt
        newSelected.push(option);
        newActivityTypes.push(option.id);
      }
      setLastCheckedIndex(realIndex);
    }

    // Aktualisiere den lokalen und globalen Zustand
    setState((prevState) => ({
      ...prevState,
      selectedActivityTypesList: newSelected,
    }));
    setIndicatorQuery((prevState) => ({
      ...prevState,
      activityTypes: newActivityTypes,
    }));
    // Zurücksetzen der analysierten Daten (da sich die Auswahl geändert hat)
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  // Überprüft ob alle Aktivitätstypen ausgewählt sind
  const allChecked =
    state.activityTypesList.length > 0 &&
    state.activityTypesList.every((option) => isChecked(option.id));
  
  // Überprüft ob mindestens ein Aktivitätstyp ausgewählt ist
  const anyChecked =
    state.activityTypesList.some((option) => isChecked(option.id));

  /**
   * Handler für "Alle auswählen"/"Alle abwählen" Funktionalität
   */
  const handleSelectAll = () => {
    if (allChecked) {
      // Alle abwählen
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
      // Alle auswählen
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
    // Zurücksetzen der analysierten Daten
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  /**
   * Entfernt einen ausgewählten Aktivitätstyp
   * @param {Object} selectedActivityType - Der zu entfernende Aktivitätstyp
   */
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
    // Zurücksetzen der analysierten Daten
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
  };

  // Render-Logik der Komponente
  return (
    <>
      {/* Haupt-Layout-Grid */}
      <Grid container spacing={4} sx={{ mb: 2 }}>
        {/* Linke Spalte - Autocomplete für Aktivitätstypen */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {/* Beschriftung für das Suchfeld */}
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Search for Activity types
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              {/* Tooltip mit Hinweis wenn keine Plattform ausgewählt ist */}
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
                {/* Autocomplete-Komponente für die Aktivitätstypen-Auswahl */}
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
                  // Render-Funktion für jede Option in der Dropdown-Liste
                  renderOption={(props, option) => {
                    const realIndex = state.activityTypesList.findIndex(
                      (o) => o.id === option.id
                    );
                    return (
                      <>
                        {/* "Alle auswählen"-Option (nur beim ersten Element) */}
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
                              {/* Checkbox für "Alle auswählen" */}
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
                        {/* Einzelne Aktivitätstyp-Option */}
                        <li {...props} style={{ display: "flex", alignItems: "center" }}>
                          <Checkbox
                            checked={isChecked(option.id)}
                            onClick={(e) => handleCheckboxChange(option, realIndex, e)}
                            sx={{ mr: 1 }}
                          />
                          {/* Anzeige des Aktivitätstyp-Namens und ID */}
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
                  // Eingabefeld für die Suche
                  renderInput={(params) => (
                    <TextField {...params} placeholder="*Activity types" />
                  )}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        {/* Rechte Spalte - Anzeige der ausgewählten Aktivitätstypen */}
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
              {/* Grid für die ausgewählten Chips */}
              <Grid container spacing={1}>
                {state.selectedActivityTypesList?.map((activityType, index) => (
                  <Grid item key={index}>
                    {/* Chip-Komponente für jeden ausgewählten Aktivitätstyp */}
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
              {/* Trennlinie unter den ausgewählten Chips */}
              <Divider />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ActivityTypes;