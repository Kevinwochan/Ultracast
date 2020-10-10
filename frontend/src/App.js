import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useCookies } from "react-cookie";
import Upload from "./pages/Upload";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Podcast from "./pages/Podcast";

export default function App() {
  const [cookies, setCookie, removeCookie] = useCookies();

  function handleCookie(key, value) {
    if (value === null) {
      removeCookie(key);
    } else {
      setCookie(key, value, { path: "/" });
    }
  }

  return (
    <Router>
      <Switch>
        <Route path="/upload">
          <Upload handleCookie={handleCookie}/>
        </Route>
        <Route path="/signin">
          <SignIn handleCookie={handleCookie} />
        </Route>
        <Route path="/signup">
          <SignUp handleCookie={handleCookie} />
        </Route>
        <Route path="/podcast">
          <Podcast handleCookie={handleCookie} />
        </Route>
        <Route path="/">
          <Dashboard cookies={cookies} handleCookie={handleCookie} />
        </Route>
      </Switch>
    </Router>
  );
}
