import React from "react";
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";


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

export default function LoggedInNavBar({handleCookie}) {
  const classes = useStyles();
  const history = useHistory();

  const handleLogout = (e) => {
    e.preventDefault();
    handleCookie("loggedin", null);
    history.push('/');
  }

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Typography variant="h6" className={classes.title}>
          <Link className={classes.link} to="/">
            <img src="/branding/7.png" style={{ width: 150 }} alt="ultracast"/>
          </Link>
        </Typography>
        <Button color="inherit">
          <Link className={classes.link} to="/upload">
            Upload
          </Link>
        </Button>
        <Button color="inherit" onClick={handleLogout}>
          <Link className={classes.link}>
            Log Out
          </Link>
        </Button>
      </Toolbar>
    </AppBar>
  );
}
