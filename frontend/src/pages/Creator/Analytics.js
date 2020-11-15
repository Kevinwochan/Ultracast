import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import TopPodcasts from "../Analytics/TopPodcasts";
import TopEpisodes from "../Analytics/TopEpisodes";
import Map from "../Analytics/Map";
import { getAnalytics } from "../../api/query";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

export default function Analytics() {
  const [cookies] = useCookies(['token']);
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics(cookies.token).then((data) => {
      setData(data);
    });
  }, [cookies.token]);

  return (
    <Container maxWidth="lg" className={classes.container}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Audience" {...a11yProps(1)} />
        </Tabs>
      </AppBar>

      <TabPanel value={value} index={0}>
        <Grid container spacing={3}>
          {/* Top Podcasts */}
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <TopPodcasts data={data} />
            </Paper>
          </Grid>
          {/* Top Episodes */}
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <TopEpisodes data={data} />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        {/* Global Heatmap */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper>
              <Map data={data} />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
}
