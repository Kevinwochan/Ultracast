import React, { useState, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import { useHistory } from "react-router-dom";
import { searchUser } from "../api/query";

const useStyles = makeStyles((theme) => ({
  input: {
    marginLeft: theme.spacing(1),
    borderBottom: "1px solid",
  },
  iconButton: {
    padding: 10,
  },
  searchBar: {
    marginBottom: theme.spacing(3),
  },
}));

export default function UserSearch() {
  const classes = useStyles();
  const history = useHistory();
  const inputRef = useRef(null);
  const [message, setMessage] = useState("");

  const search = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value)
    searchUser(
      inputRef.current.value
    ).then((userId) => {
      if (userId === null){
        setMessage("user not found");
      }else{
        history.push(`/user/${userId}`);
      }
    });
  };

  return (
    <form className={classes.searchBar} onSubmit={search}>
      <InputBase
        className={classes.input}
        placeholder="Search by a email"
        inputProps={{ "aria-label": "search by email" }}
        inputRef={inputRef}
      />
      <IconButton
        type="submit"
        className={classes.iconButton}
        aria-label="search"
        color="primary"
      >
        <SearchIcon />
      </IconButton>
      {message}
    </form >
  );
}
