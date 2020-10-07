import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../theme";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import Sidebar from "../components/Sidebar";
import LoggedInNavBar from "../components/LoggedInNavBar";

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

export default function Page({ children }) {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoggedInNavBar />
      <div className={classes.root}>
        <Sidebar />
        <main className={classes.content}>{children}</main>
      </div>
    </ThemeProvider>
  );
}
