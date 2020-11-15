import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Logo from "./Logo";

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
  toolbar: {
    maxHeight: 70,
    // maxHeight: theme.navBar.height,
    overflow: "hidden",
  },
}));

export default function NavBar() {
  const classes = useStyles();
  const navBarItems = [
    {
      name: "Sign Up",
      link: "/signup",
    },
    {
      name: "Sign In",
      link: "/signin",
    },
  ];

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Logo />
        {navBarItems.map((item) => (
          <Link to={item.link} className={classes.link} key={item.link}>
            <ListItem button key={item.name}>
              <ListItemText primary={item.name} />
            </ListItem>
          </Link>
        ))}
      </Toolbar>
    </AppBar>
  );
}
