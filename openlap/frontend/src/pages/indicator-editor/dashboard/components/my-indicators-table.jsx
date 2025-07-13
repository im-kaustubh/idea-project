import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import {
  requestIndicatorCode,
  requestIndicatorDeletion,
  requestMyIndicators,
  requestIndicatorFullDetail #added
} from "../utils/indicator-dashboard-api.js";
import { AuthContext } from "../../../../setup/auth-context-manager/auth-context-manager.jsx";
import {
  ArrowDownward,
  ArrowUpward,
  ContentCopy,
  Delete,
  Edit,
  Link,
  MoreVert,
  Preview,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { handleDisplayType } from "../utils/utils.js";
import DeleteDialog from "../../../../common/components/delete-dialog/delete-dialog.jsx";
import {fetchAnalyzedData} from "../../editor/components/analysis/utils/analytics-api.js"; #added

const MyIndicatorsTable = () => {
  const { api } = useContext(AuthContext);
  const [state, setState] = useState({
    myIndicators: [],
    pageable: {
      pageSize: 10,
      pageNumber: 0,
    },
    totalElements: 0,
    params: {
      page: 0,
      size: 10,
      sortDirection: "dsc",
      sortBy: "createdOn",
    },
    openDeleteDialog: false,
    loadingIndicators: false,
    copyCode: {
      loading: false,
      code: "",
    },
  });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const handleMenuOpen = (event, indicator) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndicator(indicator);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIndicator(null);
  };

  const toggleOpenDeleteDialog = () => {
    setState((prevState) => ({
      ...prevState,
      openDeleteDialog: !prevState.openDeleteDialog,
    }));
  };

  useEffect(() => {
    const loadMyIndicators = async (api, params) => {
      try {
        return await requestMyIndicators(api, params);
      } catch (error) {
        console.log("Error requesting my indicators");
      }
    };
    setState((prevState) => ({
      ...prevState,
      loadingIndicators: true,
    }));
    loadMyIndicators(api, state.params).then((response) => {
      setState((prevState) => ({
        ...prevState,
        myIndicators: response.content,
        pageable: response.pageable,
        totalElements: response.totalElements,
        loadingIndicators: false,
      }));
    });
  }, [api, state.params]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setState((prevState) => ({
      ...prevState,
      params: {
        ...prevState.params,
        page: newPage,
      },
    }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setState((prevState) => ({
      ...prevState,
      params: {
        ...prevState.params,
        size: parseInt(event.target.value, 10),
        page: 0,
      },
    }));
  };

  // Handle sorting
  const handleSort = (sortBy) => {
    setState((prevState) => ({
      ...prevState,
      params: {
        ...prevState.params,
        sortBy,
        sortDirection:
          prevState.params.sortBy === sortBy &&
          prevState.params.sortDirection === "asc"
            ? "dsc"
            : "asc",
        page: 0, // Reset to first page on sort change
      },
    }));
  };

  const renderSortIcon = (column) => {
    if (state.params.sortBy !== column) return null;
    return state.params.sortDirection === "asc" ? (
      <ArrowUpward fontSize="small" />
    ) : (
      <ArrowDownward fontSize="small" />
    );
  };

  const handlePreview = () => {
    handleMenuClose();
    navigate(`/indicator/${selectedIndicator.id}`);
  };

  const handleEdit = () => {
    const loadIndicatorDetail = async (api, indicatorId) => {
      try {
        return await requestIndicatorFullDetail(api, indicatorId);
      } catch (error) {
        console.log("Error requesting my indicators");
      }
    };
    const loadAnalyzedData = async (api, analysisRequest) => {
      try {
        return await fetchAnalyzedData(api, analysisRequest);
      } catch (error) {
        console.log("Error fetching analyzed data");
        return {};
      }
    };

    setState((prevState) => ({
      ...prevState,
      loadingIndicators: true,
    }));

    loadIndicatorDetail(api, selectedIndicator.id)
        .then(async (indicatorData) => {
          if (!indicatorData) return;

          console.log("indicatorData", indicatorData);

          // Build the analysis request for analyzedData
          const analysisRequest = {
            indicatorQuery: indicatorData.indicatorQuery || {
              lrsStores: [],
              platforms: [],
              activityTypes: [],
              activities: {},
              actionOnActivities: [],
              duration: {
                from: new Date().toISOString(),
                until: new Date().toISOString(),
              },
              outputs: [],
              userQueryCondition: "only_me",
            },
            analyticsTechniqueId: indicatorData.analyticsTechniqueId || "",
            analyticsTechniqueMapping: indicatorData.analyticsTechniqueMapping || { mapping: [] },
            analyticsTechniqueParams: indicatorData.analyticsTechniqueParams || [],
          };

          console.log("analysisRequest", analysisRequest);


          // Fetch analyzedData
          const analyzedDataResponse = await loadAnalyzedData(api, analysisRequest);

          // Build a complete session object with all required fields
          const sessionData = {
            indicatorQuery: analysisRequest.indicatorQuery,
            analysisRef: {
              analyticsTechniqueId: analysisRequest.analyticsTechniqueId,
              analyticsTechniqueParams: analysisRequest.analyticsTechniqueParams,
              analyticsTechniqueMapping: analysisRequest.analyticsTechniqueMapping,
              analyzedData: analyzedDataResponse.data || {},
            },
            visRef: indicatorData.visRef || {
              visualizationLibraryId: "",
              visualizationTypeId: "",
              visualizationParams: { height: 500, width: 500 },
              visualizationMapping: { mapping: [] },
            },
            analysisInputMenu: indicatorData.analysisInputMenu || {
              activities: {
                id: undefined,
                type: "Text",
                required: true,
                title: "Activities",
                description:
                    "Selected list of all the Activities specified in Activity Filter. " +
                    'E.g. courses that are selected in Activity name section are "Learning Analytics", "Data Mining" etc.',
                options: [],
              },
              activityTypes: {
                id: "statement.object.definition.type",
                type: "Text",
                required: true,
                title: "Activity Types",
                description: "Types of activities",
              },
              actionOnActivities: {
                id: undefined,
                type: "Text",
                required: true,
                title: "Actions",
                description:
                    "Selected list of actions performed on the activity(ies). E.g. a list of actions that were " +
                    'performed on a course such as "viewed", "enrolled" etc.',
                options: [],
              },
              platforms: {
                id: "statement.context.platform",
                type: "Text",
                required: true,
                title: "Platforms",
                description:
                    'Selected list of sources specified in Dataset such as "Moodle" etc.',
              },
            },
            lockedStep: indicatorData.lockedStep || {
              filter: { locked: true, openPanel: false },
              analysis: { locked: true, openPanel: false },
              visualization: { locked: true, openPanel: false },
              finalize: { locked: true, openPanel: false },
            },
            indicator: indicatorData.indicator || {
              previewData: {
                displayCode: [],
                scriptData: "",
              },
              indicatorName: indicatorData.name || "",
              type: indicatorData.type || "BASIC",
            },
            edit: true,
          };

          sessionStorage.setItem("session", JSON.stringify(sessionData));
          return sessionData;
        })
        .then(() => {
          setState((prevState) => ({
            ...prevState,
            loadingIndicators: false,
          }));
          navigate("/indicator/editor/basic");
        })
        .catch((error) => {
          setState((prevState) => ({
            ...prevState,
            loadingIndicators: false,
          }));
          console.error(error);
        });
    handleMenuClose();
  };

  const handleDuplicate = () => {
    handleMenuClose();
  };

  const handleCopyCode = () => {
    setState((prevState) => ({
      ...prevState,
      copyCode: {
        ...prevState.copyCode,
        loading: true,
      },
    }));
    const loadIndicatorCode = async (api, indicatorId) => {
      try {
        return await requestIndicatorCode(api, indicatorId);
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          copyCode: {
            ...prevState.copyCode,
            loading: false,
          },
        }));
        enqueueSnackbar(error.response.data.message, { variant: "error" });
        console.error("Error requesting my indicators");
      }
    };

    loadIndicatorCode(api, selectedIndicator.id).then((response) => {
      navigator.clipboard.writeText(response.data).then(() =>
        setState((prevState) => ({
          ...prevState,
          copyCode: {
            code: response.data,
            loading: false,
          },
        }))
      );
      enqueueSnackbar(response.message, { variant: "success" });
      handleMenuClose();
    });
  };

  const confirmDeleteIndicator = () => {
    setState((prevState) => ({
      ...prevState,
      openDeleteDialog: true,
    }));
    setAnchorEl(null);
  };

  const handleDeleteIndicator = (callback) => {
    const deleteIndicator = async (api, indicatorId) => {
      try {
        return await requestIndicatorDeletion(api, indicatorId);
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    };
    if (selectedIndicator !== null) {
      deleteIndicator(api, selectedIndicator.id).then((response) => {
        enqueueSnackbar(response.message, { variant: "success" });
        setState((prevState) => ({
          ...prevState,
          myIndicators: prevState.myIndicators.filter(
            (indicator) => indicator.id !== selectedIndicator.id
          ),
        }));
        callback();
      });
      handleMenuClose();
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container justifyContent="space-between">
            <Grid item xs>
              <Typography>My Indicators</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate("/indicator/editor")}
              >
                Create new
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper} variant="outlined">
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Grid container alignItems="center">
                      <Typography
                        variant="overline"
                        sx={{ fontWeight: "bold" }}
                      >
                        Name
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleSort("name")}
                      >
                        {renderSortIcon("name")}
                      </IconButton>
                    </Grid>
                  </TableCell>
                  <TableCell>
                    <Grid container alignItems="center">
                      <Typography
                        variant="overline"
                        sx={{ fontWeight: "bold" }}
                      >
                        Type
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleSort("indicatorType")}
                      >
                        {renderSortIcon("indicatorType")}
                      </IconButton>
                    </Grid>
                  </TableCell>

                  <TableCell align="right">
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <Typography
                        variant="overline"
                        sx={{ fontWeight: "bold" }}
                      >
                        Created On
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleSort("createdOn")}
                      >
                        {renderSortIcon("createdOn")}
                      </IconButton>
                    </Grid>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="overline" sx={{ fontWeight: "bold" }}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.myIndicators.length > 0 ? (
                  state.myIndicators.map((indicator) => (
                    <TableRow key={indicator.id}>
                      <TableCell>{indicator.name}</TableCell>
                      <TableCell>{handleDisplayType(indicator.type)}</TableCell>
                      <TableCell align="right">
                        {indicator.createdOn.split("T")[0]}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, indicator)}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={handlePreview}>
                            <ListItemIcon>
                              <Preview fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Preview Indicator" />
                          </MenuItem>
                        </MenuItem>
                        <MenuItem onClick={handleEdit}>
                          <ListItemIcon>
                            <Edit fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="Edit" />
                        </MenuItem>
                          <MenuItem
                            onClick={handleCopyCode}
                            disabled={state.copyCode.loading}
                          >
                            {state.copyCode.loading ? (
                              <>
                                <ListItemIcon>
                                  <CircularProgress size={15} />
                                </ListItemIcon>
                                <ListItemText primary="Copying code" />
                              </>
                            ) : (
                              <>
                                <ListItemIcon>
                                  <Link fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Copy Code" />
                              </>
                            )}
                          </MenuItem>
                          <Divider />
                          {/* <MenuItem onClick={handleEdit} disabled>
                            <ListItemIcon>
                              <Edit fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Edit Indicator" />
                          </MenuItem>
                          <MenuItem onClick={handleDuplicate} disabled>
                            <ListItemIcon>
                              <ContentCopy fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Duplicate Indicator" />
                          </MenuItem> */}
                          <MenuItem onClick={confirmDeleteIndicator}>
                            <ListItemIcon>
                              <Delete fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText primary="Delete Indicator" />
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ py: 1.5 }}>
                      {state.loadingIndicators ? (
                        <>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                              <CircularProgress size={18} />
                            </Grid>
                            <Grid item>
                              <Typography variant="body2" gutterBottom>
                                Loading your indicators ...
                              </Typography>
                            </Grid>
                          </Grid>
                        </>
                      ) : (
                        "No indicators found"
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={state.totalElements}
              page={state.pageable.pageNumber}
              onPageChange={handlePageChange}
              rowsPerPage={state.pageable.pageSize}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        </Grid>
      </Grid>
      <DeleteDialog
        open={state.openDeleteDialog}
        toggleOpen={toggleOpenDeleteDialog}
        message="This will delete this indicator permanently. You cannot undo this action."
        handleDelete={handleDeleteIndicator}
      />
    </>
  );
};

export default MyIndicatorsTable;
