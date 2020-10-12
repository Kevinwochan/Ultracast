import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from "@material-ui/core/Tooltip";
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";
import ExploreIcon from "@material-ui/icons/Explore";
import PublishIcon from "@material-ui/icons/Publish";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import { Link, useHistory } from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    // width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    "&:hover": {
      background: "none",
    },
  },
  hide: {
    display: "none",
  },
  drawer: {
    marginTop: 70,
    background: theme.palette.primary.main,
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    marginTop: 70,
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    marginTop: 70,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  link: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
  toolbarLink: {
    textDecoration: "none",
    color: "white",
  },
  title: {
    flexGrow: 1,
  },
  toolbar: {
    maxHeight: 70,
    // maxHeight: theme.navBar.height,
    overflow: "hidden",
    ...theme.mixins.toolbar,
  },
}));

export default function LoggedInNavBar({ handleCookie, openState, children }) {
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = openState;

  const handleLogout = (e) => {
    e.preventDefault();
    handleCookie("loggedin", null);
    history.push("/");
  };

  //! To change the sidebar menu items, modify this
  const listenerItems = [
    {
      name: "Home",
      icon: <HomeIcon />,
      link: "/",
    },
    {
      name: "Search",
      icon: <SearchIcon />,
      link: "/search",
    },
    {
      name: "Explore",
      icon: <ExploreIcon />,
      link: "/explore",
    },
    {
      name: "Library",
      icon: <LibraryMusicIcon />,
      link: "/library",
    },

    // TODO add recommended, history, friends and subscribed
  ];

  const creatorItems = [
    {
      name: "Upload",
      icon: <PublishIcon />,
      link: "/upload",
    },
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar className={classes.toolbar}>
          <Logo classes={classes} />
          <Button color="inherit" onClick={handleLogout}>
            <Link className={classes.toolbarLink}>Log Out</Link>
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <List>
          {listenerItems.map((item) => (
            <Link to={item.link} className={classes.link} key={item.link}>
              <Tooltip title={open ? "" : item.name} placement="right">
                <ListItem button key={item.name}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItem>
              </Tooltip>
            </Link>
          ))}
        </List>
        <Divider />
        <List>
          {creatorItems.map((item) => (
            <Link to={item.link} className={classes.link} key={item.link}>
              <Tooltip title={open ? "" : item.name} placement="right">
                <ListItem button key={item.name}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItem>
              </Tooltip>
            </Link>
          ))}
        </List>
        <Divider />
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          className={clsx(classes.menuButton, {
            [classes.hide]: open,
          })}
        >
          <ChevronRightIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="close drawer"
          onClick={handleDrawerClose}
          edge="start"
          className={clsx(classes.menuButton, {
            [classes.hide]: !open,
          })}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Drawer>
      {children}
    </div>
  );
}

const Logo = ({ classes }) => (
  <Link className={classes.title} to="/">
    <img src="/branding/9.svg" alt="ultracast" />
  </Link>
);
