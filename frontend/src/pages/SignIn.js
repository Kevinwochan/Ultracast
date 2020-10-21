import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Copyright from "../components/Copyright";
import axios from "axios";
import configuration from "../api/configuration";
import ucTheme from "../theme";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: ucTheme.palette.primary.main,
  },
  lock: {
    color: ucTheme.palette.primary.contrastText,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  message: {
    margin: theme.spacing(2, 0, 2, 0),
  },
}));

export default function SignIn({ handleCookie }) {
  const classes = useStyles();

  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const [message, setMessage] = useState("");

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        configuration.BACKEND_ENDPOINT,
        JSON.stringify({
          query:
            "mutation($email: String!, $password: String!) {login(input: {email: $email, password: $password}) {success token message}}",
          variables: {
            email: `${emailRef.current.value}`,
            password: `${passwordRef.current.value}`,
          },
        }),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      )
      .then((response) => {
        console.log(response);
        if (response.data.data.login.success) {
          handleCookie("token", response.data.data.login.token);
          history.push("/");
        } else {
          setMessage("Invalid email or password");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Container maxWidth="xs" component="main" className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon className={classes.lock} />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            {message.length > 0 && (
              <Alert severity="error" className={classes.message}>
                {message}
              </Alert>
            )}
          </Grid>
          <Grid item xs={12}>
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                inputRef={emailRef}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                inputRef={passwordRef}
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>
      <Box mt={25}>
        <Copyright />
      </Box>
    </>
  );
}
