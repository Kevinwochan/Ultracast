import React from "react";
import clsx from "clsx";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { makeStyles } from "@material-ui/core/styles";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  link: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
}));

export default function Sidebar() {
  const classes = useStyles();
  return (
    <Drawer
      classes={{
        paper: clsx(classes.drawerPaper),
      }}
      open={true}
      variant="permanent"
    >
      <Divider />
      <List>
        <Link to={"/recommend"} className={classes.link}>
          <ListItem button >
            <ListItemText primary="Recommended" />
          </ListItem>
        </Link>
        <Link to={"/popular"} className={classes.link}>
          <ListItem button >
            <ListItemText primary="Most Popular" />
          </ListItem>
        </Link>
        <Link to={"/trending"} className={classes.link}>
          <ListItem button >
            <ListItemText primary="Trending" />
          </ListItem>
        </Link>
        <Link to={"/history"} className={classes.link}>
          <ListItem button >
            <ListItemText primary="History" />
          </ListItem>
        </Link>
        <Link to={"/friends"} className={classes.link}>
          <ListItem button >
            <ListItemText primary="Friends" />
          </ListItem>
        </Link>
        <Link to={"/subscribed"} className={classes.link}>
          <ListItem button >
            <ListItemText primary="Subscribed" />
          </ListItem>
        </Link>
      </List>
    </Drawer>
  );
}
