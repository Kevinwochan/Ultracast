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
import Grow from "@material-ui/core/Grow";
import CircularProgress from "@material-ui/core/CircularProgress";
import Copyright from "../components/Copyright";
import { useHistory } from "react-router-dom";
import ucTheme from "../theme";
import Alert from "@material-ui/lab/Alert";
import { register } from "../api/mutation";

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
    minHeight: 36
  },
  buttonProgress: {
    color: "#4caf50",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

export default function SignUp({ handleCookie }) {
  const classes = useStyles();

  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const nameRef = React.useRef();
  const history = useHistory();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setLoading(true);
    register(
      nameRef.current.value,
      emailRef.current.value,
      passwordRef.current.value
    ).then((data) => {
      setLoading(false);
      if (data.success) {
        handleCookie("token", data.token);
        history.push("/");
      } else {
        setMessage(data.message);
      }
    });
  };

  const validate = (e) => {
    console.log("validating");
    if (!emailRef.current.value.includes("@")) {
      setMessage("Invalid Email Address");
      return false;
    }
    if (
      emailRef.current.value.charAt(emailRef.current.value.length - 4) !==
        "." &&
      emailRef.current.value.charAt(emailRef.current.value.length - 3) !== "."
    ) {
      setMessage("Invalid Email Address");
      return false;
    }
    setMessage("");
    return true;
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
            <Grow
              in={message !== ""}
              style={{ transformOrigin: "0 0 0" }}
              {...(message !== "" ? { timeout: 1000 } : {})}
            >
              <Grid item xs={12}>
                {message && <Alert severity="error">{message}</Alert>}
              </Grid>
            </Grow>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="given-name"
                inputRef={nameRef}
              />
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
                onBlur={validate}
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
            disabled={loading}
          >
            {loading ? (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                ) : (
                  "SIGN UP"
                )}
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
