import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
} from "react-router-dom";
import { useCookies } from "react-cookie";
import Page from "./common/Page";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Edit from "./pages/Edit";
import EditPodcast from "./pages/EditPodcast";
import Dashboard from "./pages/Dashboard";
import Podcast from "./pages/Podcast";
import History from "./pages/History";
import Explore from "./pages/Recommended";
import Author from "./pages/Author";
import Analytics from "./pages/Analytics";
import Subscriptions from "./pages/Subscriptions";
import Search from "./pages/Search";

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
    open: true,
    userID: "",
    audioList: [],
    playbackRate: 1,
    isCreator: true, // TODO change this on sign-in/sign-up
    creatorView: false,
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

  // Change the user's view based on the URL
  const RoleHandler = () => {
    const location = useLocation();
    useEffect(() => {
      if (!sessionState.isCreator) {
        // Only concerned with users that are creators
        return;
      }

      const creatorPath = location.pathname.includes("creators");
      if (creatorPath && !sessionState.creatorView) {
        // Change to creator view if they've navigated away from the listener view
        updateState("creatorView", true);
      } else if (!creatorPath && sessionState.creatorView) {
        // Change to listener view if they've navigated away from the creator view
        updateState("creatorView", false);
      }
    }, [location.pathname]);

    return null;
  };

  return (
    <Router>
      <RoleHandler />
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
        {/* Creator Paths */}
        <Route path="/creators/upload">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state}>
              <Upload userToken={sessionState.cookies.token} />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/creators/podcasts">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state}>
              <Edit userToken={sessionState.cookies.token} />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/creators/podcast/:podcastId">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state}>
              <EditPodcast
                userToken={sessionState.cookies.token}
                state={state}
              />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/creators/analytics">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state}>
              <Analytics />
            </Page>
          </PrivateRoute>
        </Route>

        {/* Listener Paths */}
        <Route path="/podcast/:podcastId">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <Podcast state={state} />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/history">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <History state={state} />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/search">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <Search />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/explore">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <Explore state={state} />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/author/:id">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <Author state={state} />
            </Page>
          </PrivateRoute>
        </Route>
        <Route path="/subscriptions">
          <PrivateRoute cookies={cookies}>
            <Page handleCookie={handleCookie} state={state} player>
              <Subscriptions state={state} />
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
