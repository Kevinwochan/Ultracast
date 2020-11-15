import { makeStyles } from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";
import React from "react";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
}));

export default function Logo() {
  const classes = useStyles();

  return (
    <div className={classes.grow}>
      <Link className={classes.grow} to="/">
        <img
          onError={(e) => {
            e.target.src = `/branding/square.svg`;
          }}
          src="/branding/white.svg"
          alt="ultracast"
        />
      </Link>
    </div>
  );
}
