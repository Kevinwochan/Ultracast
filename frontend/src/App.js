import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useCookies } from "react-cookie";
import Page from "./common/Page";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Podcast from "./pages/Podcast";
import History from "./pages/History";
import Author from "./pages/Author";
import Analytics from "./pages/Analytics";

function PrivateRoute({ cookies, children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        cookies.token ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

export default function App() {
  //Top level state (variables that are stored between pages)
  const [cookies, setCookie, removeCookie] = useCookies();
  const [sessionState, setState] = useState({
    open: false,
    audioList: [],
    cookies: cookies,
  });

  // Update the session state
  const updateState = (variable, value) => {
    setState((prevState) => ({
      ...prevState,
      [variable]: value,
    }));
  };

  const state = [sessionState, updateState];

  function handleCookie(key, value) {
    // Only downside to a single state object is that we need to setCookie in two places now
    if (value === null) {
      removeCookie(key);
      updateState("cookies", key, null);
    } else {
      setCookie(key, value, { path: "/" });
      updateState("cookies", { ...sessionState.cookies, [key]: value });
    }
  }

  return (
    <Router>
      <Switch>
        {/* Public Routes */}
        <Route path="/landing">
          <Page handleCookie={handleCookie} state={state}>
            <Landing />
          </Page>
        </Route>
        <Route path="/signin">
          <Page handleCookie={handleCookie} state={state}>
            <SignIn handleCookie={handleCookie} />
          </Page>
        </Route>
        <Route path="/signup">
          <Page handleCookie={handleCookie} state={state}>
            <SignUp handleCookie={handleCookie} />
          </Page>
        </Route>

        {/* Logged In Routes */}
        <Route path="/upload">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state}>
              <Upload />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/podcast">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <Podcast />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/history">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <History />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/author">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <Author />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/analytics">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state}>
              <Analytics />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <Dashboard state={state} />
            </Page>
          </PrivateRoute>
        </Route>
      </Switch>
    </Router>
  );
}
