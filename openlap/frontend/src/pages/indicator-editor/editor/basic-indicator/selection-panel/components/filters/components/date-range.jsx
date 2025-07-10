import { useContext } from "react";
import { Grid, Typography } from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { BasicIndicatorContext } from "../../../../basic-indicator.jsx";
import dayjs from "dayjs";

const DateRange = () => {
  const { indicatorQuery, setIndicatorQuery, setAnalysisRef } = useContext(BasicIndicatorContext);

  const minSelectableDate = dayjs("2000-01-01");
  const maxSelectableDate = dayjs();
  
  //const shouldDisableDate = (date) => {
    //const year = date.year();
    // Disable dates from 2001 to 2010 inclusive
    //return year >= 2001 && year <= 2010;
 // };

  const handleUpdateStartDate = (value) => {
    setAnalysisRef((prev) => ({ ...prev, analyzedData: {} }));
    setIndicatorQuery((prev) => ({
      ...prev,
      duration: { ...prev.duration, from: value.toISOString() },
    }));
  };

  const handleUpdateEndDate = (value) => {
    setAnalysisRef((prev) => ({ ...prev, analyzedData: {} }));
    setIndicatorQuery((prev) => ({
      ...prev,
      duration: { ...prev.duration, until: value.toISOString() },
    }));
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select a timeframe
      </Typography>
      <Grid container spacing={2}>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker"]}>
              <DatePicker
                label="Start date"
                value={dayjs(indicatorQuery.duration.from)}
                onChange={handleUpdateStartDate}
                minDate={minSelectableDate}
                maxDate={maxSelectableDate}
                //shouldDisableDate={shouldDisableDate}
                openTo="year"
                views={["year", "month", "day"]}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker"]}>
              <DatePicker
                label="End date"
                value={dayjs(indicatorQuery.duration.until)}
                onChange={handleUpdateEndDate}
                minDate={minSelectableDate}
                maxDate={maxSelectableDate}
                //shouldDisableDate={shouldDisableDate}
                openTo="year"
                views={["year", "month", "day"]}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Grid>
      </Grid>
    </>
  );
};

export default DateRange;

