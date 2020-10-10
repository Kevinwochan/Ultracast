import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useCookies } from "react-cookie";
import Upload from "./pages/Upload";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Podcast from "./pages/Podcast";

export default function App() {
  const [cookies, setCookie] = useCookies();

  function handleCookie(key, value) {
    setCookie(key, value, { path: "/" });
  }

  return (
    <Router>
      <Switch>
        <Route path="/upload">
          <Upload />
        </Route>
        <Route path="/signin">
          <SignIn />
        </Route>
        <Route path="/signup">
          <SignUp handleCookie={handleCookie} />
        </Route>
        <Route path="/podcast">
          <Podcast />
        </Route>
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </Router>
  );
}
