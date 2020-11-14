import React from "react";
import { useCookies } from "react-cookie";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../theme";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import UserLayout from "../components/UserLayout";
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

export default function Page({ player, children, creator }) {
  const classes = useStyles();
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {cookies.token ? (
        <>
          {player}
          <UserLayout creator={creator}>
            <div className={classes.root}>
              <main className={`${classes.content} ${classes.contentLoggedIn}`}>
                {children}
              </main>
            </div>
          </UserLayout>
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
