/*
import { Divider, Grid, Typography } from "@mui/material";
import React from "react";

const GQIDashboard = () => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography>GQI Dashboard</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
      </Grid>
    </>
  );
};
export default GQIDashboard;
*/
import { Divider, Grid, Typography, Button } from "@mui/material"; // Import Button
import React, { useState } from "react"; // Import useState

const GQIDashboard = () => {
  // Create a state and initialize with string
  const [myState, setMyState] = useState("initial value");

  // Function to console log the value of the state
  const logStateValue = () => {
    console.log(myState);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography>GQI Dashboard</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={logStateValue}>
            this is a button
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
export default GQIDashboard;