import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../theme";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import Sidebar from "../components/Sidebar";
import LoggedInNavBar from "../components/LoggedInNavBar";
import NavBar from "../components/NavBar";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  content: {
    flexGrow: 1,
    overflow: "auto",
    background: "#eeeeee",
  },
}));

export default function Page({ children, handleCookie, cookies }) {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {cookies.loggedin ? (
        <LoggedInNavBar handleCookie={handleCookie} />
      ) : (
        <NavBar />
      )}
      <div className={classes.root}>
        {cookies.loggedin && <Sidebar />}
        <main className={classes.content}>{children}</main>
      </div>
    </ThemeProvider>
  );
}
