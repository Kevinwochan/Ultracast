import React from "react";
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
import Page from "../common/Page";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    // TODO for some reason, theme here is the default theme :/
    // backgroundColor: theme.palette.secondary.main,
    backgroundColor: "#ffde59",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn({ handleCookie, cookies }) {
  const classes = useStyles();

  const emailRef = React.useRef();
  const passwordRef = React.useRef();

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    /*
    axios
      .post(
        configuration.BACKEND_ENDPOINT,
        JSON.stringify({
          query:
            "query($email: String!, $password: String!) {isUser(email: $email, password: $password) {jwt}}",
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
      })
      .catch((err) => {console.log(err)});*/
    handleCookie("loggedin", true);
    history.push("/");
  };

  return (
    <>
      <Page cookies={cookies} handleCookie={handleCookie}>
        <Container maxWidth="xs" component="main" className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon color="primary" />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
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
        </Container>
        <Box mt={25}>
          <Copyright />
        </Box>
      </Page>
    </>
  );
}
