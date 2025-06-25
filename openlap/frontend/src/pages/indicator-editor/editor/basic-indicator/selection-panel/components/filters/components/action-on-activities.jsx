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
  Button,
  Box,
} from "@mui/material";
import { AuthContext } from "../../../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { fetchActionOnActivitiesList } from "../utils/filters-api.js";
import { getLastWordAndCapitalize } from "../../../utils/utils.js";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";

const ActionOnActivities = ({ state, setState }) => {
  const { api } = useContext(AuthContext);
  const {
    indicatorQuery,
    setIndicatorQuery,
    setAnalysisInputMenu,
    setAnalysisRef,
    setLockedStep,
    setGenerate,
    setIndicator,
    setVisRef,
  } = useContext(BasicIndicatorContext);

  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [pendingCheckedOptions, setPendingCheckedOptions] = useState({});

  useEffect(() => {
    const loadActivityTypesData = async () => {
      try {
        const actionsData = await fetchActionOnActivitiesList(
          api,
          indicatorQuery.lrsStores,
          indicatorQuery.platforms,
          indicatorQuery.activityTypes,
          indicatorQuery.activities
        );
        setState((prevState) => ({
          ...prevState,
          actionsList: actionsData.filter(
            (action) => !indicatorQuery.actionOnActivities.includes(action)
          ),
        }));
      } catch (error) {
        console.log("Failed to load Action on Activities list", error);
      }
    };
    if (state.selectedActivitiesList.length > 0) {
      loadActivityTypesData();
    }
  }, [state.selectedActivitiesList.length]);

  const handleCheckboxChange = (id) => {
    setPendingCheckedOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllCheckboxes = () => {
    const allChecked = {};
    state.actionsList.forEach((option) => {
      allChecked[option.id] = true;
    });
    setPendingCheckedOptions(allChecked);
  };

  const handleDeselectAllCheckboxes = () => {
    setPendingCheckedOptions({});
  };

  const areAllChecked =
    state.actionsList.length > 0 &&
    state.actionsList.every((option) => pendingCheckedOptions[option.id]);

  const isAnyChecked = Object.values(pendingCheckedOptions).some(Boolean);

  const handleApplyChecked = () => {
    const selectedIds = Object.entries(pendingCheckedOptions)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);

    const selectedActions = state.actionsList.filter((action) =>
      selectedIds.includes(action.id)
    );

    setState((prevState) => ({
      ...prevState,
      selectedActionsList: [
        ...prevState.selectedActionsList,
        ...selectedActions,
      ],
      actionsList: prevState.actionsList.filter(
        (action) => !selectedIds.includes(action.id)
      ),
    }));

    setIndicatorQuery((prevState) => ({
      ...prevState,
      actionOnActivities: [
        ...prevState.actionOnActivities,
        ...selectedActions.map((a) => a.id),
      ],
    }));

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    setPendingCheckedOptions({});
  };

  const handleDeleteAllSelected = () => {
    setState((prevState) => ({
      ...prevState,
      actionsList: [
        ...prevState.actionsList,
        ...prevState.selectedActionsList,
      ].sort((a, b) => a.name.localeCompare(b.name)),
      selectedActionsList: [],
    }));
    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));
    setIndicatorQuery((prevState) => ({
      ...prevState,
      actionOnActivities: [],
    }));
  };

  const handleSelectActionOnActivity = (selectedAction) => {
    setState((prevState) => ({
      ...prevState,
      actionsList: prevState.actionsList.filter(
        (item) => item.id !== selectedAction.id
      ),
      selectedActionsList: [...prevState.selectedActionsList, selectedAction],
      autoCompleteValue: null,
    }));

    setIndicatorQuery((prevState) => ({
      ...prevState,
      actionOnActivities: [...prevState.actionOnActivities, selectedAction.id],
    }));

    setAnalysisRef((prevState) => ({
      ...prevState,
      analyzedData: {},
    }));

    setAnalysisInputMenu((prevState) => {
      let tempActionOptionExists = [
        ...prevState.actionOnActivities.options,
      ].some((output) => output === selectedAction.queryId);
      if (!tempActionOptionExists) {
        let tempOptions = [
          ...prevState.actionOnActivities.options,
          selectedAction.queryId,
        ];
        return {
          ...prevState,
          actionOnActivities: {
            ...prevState.actionOnActivities,
            id: tempOptions.length === 1 ? tempOptions[0] : undefined,
            options: tempOptions,
          },
        };
      }
      return prevState;
    });
  };

  const handleDeselectActionOnActivity = (selectedAction) => {
    setState((prevState) => {
      let tempSelectedActionList = prevState.selectedActionsList.filter(
        (item) => item.id !== selectedAction.id
      );

      setAnalysisRef((prevState) => ({
        ...prevState,
        analyzedData: {},
      }));

      setVisRef((prevState) => {
        return {
          ...prevState,
          visualizationLibraryId: "",
          visualizationTypeId: "",
          visualizationMapping: {
            ...prevState.visualizationMapping,
            mapping: [],
          },
        };
      });
      setGenerate(false);
      setIndicator((prevState) => ({
        ...prevState,
        previewData: {
          ...prevState.previewData,
          displayCode: [],
          scriptData: "",
        },
      }));
      setLockedStep((prevState) => ({
        ...prevState,
        visualization: {
          locked: true,
          openPanel: false,
        },
        finalize: {
          ...prevState.finalize,
          locked: true,
          openPanel: false,
        },
      }));

      setAnalysisInputMenu((prevInputState) => {
        const uniqueQueryIds = [
          ...new Set(tempSelectedActionList.map((item) => item.queryId)),
        ];
        return {
          ...prevInputState,
          actionOnActivities: {
            ...prevInputState.actionOnActivities,
            id: uniqueQueryIds.length === 1 ? uniqueQueryIds[0] : undefined,
            options: uniqueQueryIds,
          },
        };
      });

      return {
        ...prevState,
        actionsList: [...prevState.actionsList, selectedAction].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        selectedActionsList: tempSelectedActionList,
        autoCompleteValue: null,
      };
    });

    setIndicatorQuery((prevState) => {
      return {
        ...prevState,
        actionOnActivities: prevState.actionOnActivities.filter(
          (item) => item !== selectedAction.id
        ),
      };
    });
  };

  return (
    <>
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Search for Actions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Tooltip
                arrow
                title={
                  Object.entries(indicatorQuery.activities).length === 0 ? (
                    <Typography variant="body2">
                      Select at least one Activity from above to view the list
                      of Actions.
                    </Typography>
                  ) : undefined
                }
              >
                <Autocomplete
                  open={autocompleteOpen}
                  onOpen={() => setAutocompleteOpen(true)}
                  onClose={() => setAutocompleteOpen(false)}
                  disabled={
                    Object.entries(indicatorQuery.activities).length === 0
                  }
                  disablePortal
                  disableCloseOnSelect
                  id="combo-box-lrs"
                  options={state.actionsList}
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
                  getOptionLabel={(option) => option?.name}
                  renderOption={(props, option, { index }) => {
                    const { key, ...restProps } = props;
                    const label = { inputProps: { "aria-label": option.name } };
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
                                  areAllChecked
                                    ? handleDeselectAllCheckboxes()
                                    : handleSelectAllCheckboxes();
                                }}
                                sx={{ ml: 2, mr: 1 }}
                                inputProps={{ "aria-label": "Alle auswählen" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 24, mr: 1 }}
                              >
                                {
                                  Object.values(pendingCheckedOptions).filter(
                                    Boolean
                                  ).length
                                }{" "}
                                selected
                              </Typography>
                              <Box sx={{ flexGrow: 1 }} />
                              {isAnyChecked && (
                                <Button
                                  sx={{
                                    mr: 2,
                                    minWidth: 0,
                                    px: 2,
                                    height: 32,
                                  }}
                                  variant="contained"
                                  size="small"
                                  color="primary"
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
                              <Typography>{option?.name}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2">{option?.id}</Typography>
                            </Grid>
                          </Grid>
                        </li>
                      </>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="*Actions" />
                  )}
                  onChange={(event, value) => {
                    if (value) handleSelectActionOnActivity(value);
                  }}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mr: 1 }}
                >
                  Selected <b>Action(s)</b>
                </Typography>
                {state.selectedActionsList.length > 0 && (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{
                      ml: 1,
                      textDecoration: "underline",
                      cursor: "pointer",
                      userSelect: "none",
                      "&:hover": {
                        textDecoration: "underline",
                        color: "primary.dark",
                      },
                    }}
                    onClick={handleDeleteAllSelected}
                  >
                    delete all
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                {state.selectedActionsList?.map((action, index) => (
                  <Grid item key={index}>
                    <Chip
                      color="primary"
                      label={getLastWordAndCapitalize(action.name)}
                      onDelete={() => handleDeselectActionOnActivity(action)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ mt: state.selectedActionsList.length > 0 ? 0.5 : 5.5 }}
            >
              <Divider />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ActionOnActivities;
