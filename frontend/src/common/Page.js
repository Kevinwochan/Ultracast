import React, { useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../theme";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import LoggedInNavBar from "../components/LoggedInNavBar";
import NavBar from "../components/NavBar";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100%",
  },
  content: {
    flexGrow: 1,
    overflow: "auto",
    background: "#eeeeee",
    minHeight: `calc(100vh - 70px)`,
    // minHeight: `calc(100vh - ${theme.navBar.height}px)`,
  },
  contentLoggedIn: {
    marginTop: 70,
  },
}));

export default function Page({ state, handleCookie, children }) {
  const classes = useStyles();
  const [sessionState, updateState] = state;
  const cookies = sessionState.cookies;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {cookies.loggedin ? (
        <LoggedInNavBar handleCookie={handleCookie} state={state}>
          {/* Really, this is the nav bar + sidebar */}
          {/* sorry Kev, couldn't format it any better and it's turned out kinda gross here :/ */}
          <div className={classes.root}>
            <main className={`${classes.content} ${classes.contentLoggedIn}`}>
              {children}
            </main>
          </div>
        </LoggedInNavBar>
      ) : (
        <>
          <NavBar />
          <div className={classes.root}>
            <main className={classes.content}>{children}</main>
          </div>
        </>
      )}
    </ThemeProvider>
  );
}
