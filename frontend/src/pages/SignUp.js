import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
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
import { useHistory } from "react-router-dom";
import Page from "../common/Page";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp({handleCookie, cookies}) {
  const classes = useStyles();

  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        configuration.BACKEND_ENDPOINT,
        JSON.stringify({
          query:
            "mutation($email: String!, $password: String!) {createUser(input: {email: $email, password: $password}) {success}}",
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
        console.log(response.data.data.createUser.success);
        if (response.data.data.createUser.success){
          handleCookie("loggedin", true);
          history.push("/");
        }
      })
      .catch((err) => {console.log(err)});
  };

  return (
    <>
      <Page cookies={cookies} handleCookie={handleCookie}>
        <Container maxWidth="xs" component="main" className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  inputRef={emailRef}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  inputRef={passwordRef}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign Up
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="/signin" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </Container>
        <Box mt={5}>
          <Copyright />
        </Box>
      </Page>
    </>
  );
}
