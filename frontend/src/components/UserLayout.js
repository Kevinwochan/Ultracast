import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Avatar from "@material-ui/core/Avatar";
import PersonIcon from "@material-ui/icons/Person";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Tooltip from "@material-ui/core/Tooltip";
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";
import ExploreIcon from "@material-ui/icons/Explore";
import PublishIcon from "@material-ui/icons/Publish";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import HistoryIcon from "@material-ui/icons/History";
import ShowChartIcon from "@material-ui/icons/ShowChart";
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
  avatar: {
    margin: theme.spacing(1),
    // TODO for some reason, theme here is the default theme :/
    // backgroundColor: theme.palette.secondary.main,
    backgroundColor: "#ffde59",
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

export default function UserLayout({ handleCookie, state, children }) {
  const classes = useStyles();
  const [sessionState, updateState] = state;
  const open = sessionState.open;

  const handleDrawerOpen = () => {
    updateState("open", true);
  };

  const handleDrawerClose = () => {
    updateState("open", false);
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
          <AccountOptions classes={classes} handleCookie={handleCookie} />
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
        <ListenerSideBar classes={classes} open={open} />
        <Divider />
        <CreatorSideBar classes={classes} open={open} />
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

const ListenerSideBar = ({ classes, open }) => {
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
      link: "/author/1",
    },
    {
      name: "History",
      icon: <HistoryIcon />,
      link: "/History",
    },

    // TODO add recommended, history, friends and subscribed
  ];

  return (
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
  );
};

const CreatorSideBar = ({ classes, open }) => {
  const creatorItems = [
    {
      name: "Upload",
      icon: <PublishIcon />,
      link: "/upload",
    },
    {
      name: "Analytics",
      icon: <ShowChartIcon />,
      link: "/analytics",
    },
  ];

  return (
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
  );
};

const AccountOptions = ({ classes, handleCookie }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const history = useHistory();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    handleCookie("loggedin", null);
    history.push("/");
  };

  return (
    <div>
      <IconButton
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar className={classes.avatar}>
          <PersonIcon color="primary" />
        </Avatar>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          <Link to="/profile" className={classes.link}>
            Profile
          </Link>
        </MenuItem>
        <MenuItem>
          <Link to="/profile" className={classes.link}>
            Account Settings
          </Link>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Log Out</MenuItem>
      </Menu>
    </div>
  );
};
