import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Copyright from "../components/Copyright";
import { useHistory } from "react-router-dom";
import ucTheme from "../theme";
import Alert from "@material-ui/lab/Alert";
import { register } from "../api/query";

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: ucTheme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: ucTheme.spacing(1),
    backgroundColor: ucTheme.palette.primary.main,
  },
  lock: {
    color: ucTheme.palette.primary.contrastText,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: ucTheme.spacing(3),
  },
  submit: {
    margin: ucTheme.spacing(3, 0, 2),
  },
}));

export default function SignUp({ handleCookie }) {
  const classes = useStyles();

  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const history = useHistory();
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    register(emailRef.current.value, passwordRef.current.value).then((data) => {
      console.log(data);
      if (data.success) {
        handleCookie("token", data.token);
        history.push("/");
      } else {
        setMessage(data.message);
      }
    })
  };

  return (
    <>
      <Container maxWidth="xs" component="main" className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon className={classes.lock} />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {message.length > 0 && <Alert severity="error">{message}</Alert>}
            </Grid>
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
    </>
  );
}
