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
import Upload from "./pages/Creator/Upload";
import Edit from "./pages/Creator/Edit";
import EditPodcast from "./pages/Creator/EditPodcast";
import Analytics from "./pages/Creator/Analytics";
import Dashboard from "./pages/Listener/Dashboard";
import Podcast from "./pages/Listener/Podcast";
import History from "./pages/Listener/History";
import Author from "./pages/Listener/Author";
import Subscriptions from "./pages/Listener/Subscriptions";
import Search from "./pages/Listener/Search";
import Following from "./pages/Listener/Following";
import User from "./pages/Listener/User";
import Bookmarks from "./pages/Listener/Bookmarks";
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
