import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useCookies } from "react-cookie";
import Upload from "./pages/Upload";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
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
        cookies.loggedin ? (
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
          <PrivateRoute cookies={cookies}>
            <Upload cookies={cookies} handleCookie={handleCookie} />
          </PrivateRoute>
        </Route>
        <Route path="/signin">
          <SignIn cookies={cookies} handleCookie={handleCookie} />
        </Route>
        <Route path="/signup">
          <SignUp cookies={cookies} handleCookie={handleCookie} />
        </Route>
        <Route path="/podcast">
          <PrivateRoute cookies={cookies}>
            <Podcast cookies={cookies} handleCookie={handleCookie} />
          </PrivateRoute>
        </Route>
        <Route path="/history">
          <PrivateRoute cookies={cookies}>
            <History cookies={cookies} handleCookie={handleCookie} />
          </PrivateRoute>
        </Route>
        <Route path="/author">
          <PrivateRoute cookies={cookies}>
            <Author cookies={cookies} handleCookie={handleCookie} />
          </PrivateRoute>
        </Route>
        <Route path="/analytics">
          <PrivateRoute cookies={cookies}>
            <Analytics cookies={cookies} handleCookie={handleCookie} />
          </PrivateRoute>
        </Route>
        <Route path="/">
          <PrivateRoute cookies={cookies}>
            <Dashboard cookies={cookies} handleCookie={handleCookie} />
          </PrivateRoute>
        </Route>
      </Switch>
    </Router>
  );
}
