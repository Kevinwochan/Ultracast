import React, { useEffect } from "react";
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
import PublishIcon from "@material-ui/icons/Publish";
import AlarmIcon from "@material-ui/icons/Alarm";
import HistoryIcon from "@material-ui/icons/History";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import PeopleIcon from "@material-ui/icons/People";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import { Link, useHistory } from "react-router-dom";
import ucTheme from "../theme";
import Logo from "./Logo";
import Notifications from "./Notifications";
import { useFormControl } from "@material-ui/core";
import { getUser } from "../api/query";

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
    backgroundColor: ucTheme.palette.secondary.main,
  },
  icon: {
    color: ucTheme.palette.secondary.contrastText,
  },
  actionIcon: {
    color: ucTheme.palette.secondary.main,
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
    background: ucTheme.palette.background.dark,
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    marginTop: 70,
    background: ucTheme.palette.background.dark,
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    marginTop: 70,
    background: ucTheme.palette.background.dark,
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

  const SideBar =
    sessionState.isCreator && sessionState.creatorView
      ? () => <CreatorSideBar classes={classes} open={open} />
      : () => <ListenerSideBar classes={classes} open={open} />;

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar className={classes.toolbar}>
          <Logo />
          {/* <Notifications state={state} /> */}
          <AccountOptions state={state} handleCookie={handleCookie} />
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
        <SideBar />
        <Divider />

        <List>
          <Tooltip title={open ? "" : "Open sidebar"} placement="right">
            <ListItem
              button
              onClick={handleDrawerOpen}
              className={open ? classes.hide : ""}
            >
              <ListItemIcon>
                <ChevronRightIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          <ListItem
            button
            onClick={handleDrawerClose}
            className={!open ? classes.hide : ""}
          >
            <ListItemIcon>
              <ChevronLeftIcon />
            </ListItemIcon>
            <ListItemText primary="Collapse sidebar" />
          </ListItem>
        </List>
      </Drawer>
      {children}
    </div>
  );
}

const ListenerSideBar = ({ open }) => {
  const classes = useStyles();
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
      name: "Subscriptions",
      icon: <AlarmIcon />,
      link: "/subscriptions",
    },
    {
      name: "Following",
      icon: <PeopleIcon />,
      link: "/following",
    },
    {
      name: "Recently Listened",
      icon: <HistoryIcon />,
      link: "/history",
    },
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

const CreatorSideBar = ({ open }) => {
  const classes = useStyles();
  const creatorItems = [
    {
      name: "My Podcasts",
      icon: <LibraryMusicIcon />,
      link: "/creators/podcasts",
    },
    {
      name: "Upload",
      icon: <PublishIcon />,
      link: "/creators/upload",
    },
    {
      name: "Analytics",
      icon: <ShowChartIcon />,
      link: "/creators/analytics",
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

const AccountOptions = ({ state, handleCookie }) => {
  const classes = useStyles();
  const [sessionState, updateState] = state;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const history = useHistory();

  useEffect(() => {
    getUser(sessionState.cookies.token).then((user) => setUser(user));
  }, [sessionState]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    handleCookie("token", null);
    history.push("/");
  };

  const creatorTitle = sessionState.creatorView
    ? "For listeners"
    : "For creators";
  const creatorLink = sessionState.creatorView ? "/" : "/creators/podcasts";

  return (
    <>
      <IconButton
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar className={classes.avatar}>
          <PersonIcon className={classes.icon} />
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
        {user && user.name && <ListItem>{user.name}</ListItem>}
        {sessionState.isCreator && (
          <MenuItem>
            <Link to={creatorLink} className={classes.link}>
              {creatorTitle}
            </Link>
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>Log Out</MenuItem>
      </Menu>
    </>
  );
};
