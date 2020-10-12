import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';


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
  link : {
    textDecoration: 'none',
    color: 'white',
  },
}));


export default function NavBar(){
  const classes = useStyles();
  return (
    <AppBar position="static">
      <Toolbar>
      <Typography variant="h6" className={classes.title}>
          <Link className={classes.link} to="/">
            <img src="/branding/7.png" style={{ width: 150 }} alt="ultracast"/>
          </Link>
        </Typography>
          <Button color="inherit"><Link className={classes.link} to="/signup">Sign Up</Link></Button>
          <Button color="inherit"><Link className={classes.link} to="/signin">Sign In</Link></Button>
      </Toolbar>
    </AppBar>
  );
};

