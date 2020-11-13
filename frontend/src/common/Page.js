import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../theme";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import UserLayout from "../components/UserLayout";
import Player from "../components/AudioPlayer/Player";
import NavBar from "../components/NavBar";
import ucTheme from "../theme";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    width: "100%",
  },
  content: {
    flexGrow: 1,
    overflow: "auto",
    background: ucTheme.palette.background.default,
    minHeight: `calc(100vh - ${ucTheme.navBar.height}px)`,
  },
  contentLoggedIn: {
    marginTop: 70,
    marginBottom: 80,
  },
}));

export default function Page({ state, handleCookie, player, children }) {
  const classes = useStyles();
  const [sessionState, updateState] = state;
  const cookies = sessionState.cookies;

  // Show the player if we're playing something, or if the player prop has been passed.
  // TODO need to have a longer think about this functionality
  const showPlayer = sessionState.isPlaying || player;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {cookies.token ? (
        <>
          <UserLayout handleCookie={handleCookie} state={state}>
            {/* Really, this is the nav bar + sidebar */}
            {/* sorry Kev, couldn't format it any better and it's turned out kinda gross here :/ */}
            <div className={classes.root}>
              <main className={`${classes.content} ${classes.contentLoggedIn}`}>
                {children}
              </main>
            </div>
          </UserLayout>
          {showPlayer ? <Player state={state} /> : null}
        </>
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
