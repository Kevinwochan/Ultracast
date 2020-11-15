import React, { useState, useRef } from "react";
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
import Upload from "./pages/Upload";
import Edit from "./pages/Edit";
import EditPodcast from "./pages/EditPodcast";
import Dashboard from "./pages/Dashboard";
import Podcast from "./pages/Podcast";
import History from "./pages/History";
import Recommended from "./pages/Recommended";
import Author from "./pages/Author";
import Analytics from "./pages/Analytics";
import Subscriptions from "./pages/Subscriptions";
import Search from "./pages/Search";
import Following from "./pages/Following";
import User from "./pages/User";
import Bookmarks from "./pages/Bookmarks";
import NewPlayer from "./components/AudioPlayer/NewPlayer";

function PrivateRoute({ children, ...rest }) {
  const [cookies] = useCookies(["token"]);
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

function LoggedInRedirect({ children, ...rest }) {
  const [cookies] = useCookies(["token"]);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        !cookies.token ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
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
  const [audioPlayerControls, setAudioPlayerControls] = useState({
    addAudio: () => {},
    playNow: () => {},
  });
  const audioPlayer = useRef(
    <NewPlayer setAudioPlayerControls={setAudioPlayerControls} />
  );

  return (
    <Router>
      <Switch>
        {/* Public Routes */}
        <LoggedInRedirect path="/signin">
          <Page>
            <SignIn />
          </Page>
        </LoggedInRedirect>
        <LoggedInRedirect path="/signup">
          <Page>
            <SignUp />
          </Page>
        </LoggedInRedirect>
        {/* Creator Paths */}
        <PrivateRoute path="/creators">
          <Page creator>
            <PrivateRoute path="/creators/upload">
              <Upload />
            </PrivateRoute>
            <PrivateRoute path="/creators/podcasts">
              <Edit />
            </PrivateRoute>
            <PrivateRoute path="/creators/podcast/:podcastId">
              <EditPodcast />
            </PrivateRoute>
            <PrivateRoute path="/creators/analytics">
              <Analytics />
            </PrivateRoute>
          </Page>
        </PrivateRoute>
        {/* Listener Paths */}
        <PrivateRoute path="/">
          <Page player={audioPlayer.current}>
            <Switch>
              <PrivateRoute path="/podcast/:podcastId">
                <Podcast audioPlayerControls={audioPlayerControls} />
              </PrivateRoute>
              <PrivateRoute path="/history">
                <History audioPlayerControls={audioPlayerControls} />
              </PrivateRoute>
              <PrivateRoute path="/search">
                <Search />
              </PrivateRoute>
              <PrivateRoute path="/author/:id">
                <Author />
              </PrivateRoute>
              <PrivateRoute path="/subscriptions">
                <Subscriptions />
              </PrivateRoute>
              <PrivateRoute path="/following">
                <Following audioPlayerControls={audioPlayerControls} />
              </PrivateRoute>
              <PrivateRoute path="/user/:id">
                <User />
              </PrivateRoute>
              <PrivateRoute path="/bookmarks">
                <Bookmarks audioPlayerControls={audioPlayerControls} />
              </PrivateRoute>
              <PrivateRoute path="/">
                <Dashboard audioPlayerControls={audioPlayerControls} />
              </PrivateRoute>
            </Switch>
          </Page>
        </PrivateRoute>
      </Switch>
    </Router>
  );
}
