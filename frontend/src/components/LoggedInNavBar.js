import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  link: {
    textDecoration: "none",
    color: "white",
  },
}));

export default function LoggedInNavBar() {
  const classes = useStyles();
  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Typography variant="h6" className={classes.title}>
          <Link className={classes.link} to="/">
            SiteLogo
          </Link>
        </Typography>
        <Button color="inherit">
          <Link className={classes.link} to="/upload">
            Upload
          </Link>
        </Button>
        <Button color="inherit">
          <Link className={classes.link} to="/logout">
            Log Out
          </Link>
        </Button>
      </Toolbar>
    </AppBar>
  );
}
