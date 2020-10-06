import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Podcast from "./pages/Podcast";

export default function App() {
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
          <SignUp />
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
