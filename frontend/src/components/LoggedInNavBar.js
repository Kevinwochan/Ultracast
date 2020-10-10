import React from "react";
import { Link, useHistory } from "react-router-dom";
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

export default function LoggedInNavBar({handleDrawerOpen, isOpen, handleCookie}) {
  const classes = useStyles();
  const history = useHistory();

  const handleLogout = () => {
    handleCookie("loggedin", null);
    history.push('/');
  }

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          className={clsx(classes.menuButton, isOpen && classes.menuButtonHidden)}
          onClick={handleDrawerOpen}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          <Link className={classes.link} to="/">
            Home
          </Link>
        </Typography>
        <Button color="inherit" onClick={handleLogout}>
          <Link className={classes.link}>
            Log Out
          </Link>
        </Button>
      </Toolbar>
    </AppBar>
  );
}
