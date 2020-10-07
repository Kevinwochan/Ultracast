import { Button, makeStyles, ThemeProvider } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import DeleteIcon from "@material-ui/icons/Delete";
import CancelIcon from "@material-ui/icons/Cancel";
import React from "react";
import theme from "../theme";

export default function Upload() {
  const classes = useStyles();
  getData();
  /* TODO */
  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={4}>
          Photo
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box p={5}>
            <form className={classes.fields} noValidate autoComplete="off">
              <TextField id="title" label="Title" variant="outlined" />
              <TextField
                id="description"
                multiline
                rows={3}
                variant="outlined"
                label="Description"
              />
              <TextField id="podcast" variant="outlined" label="Podcast" />
            </form>
          </Box>
          <div className={classes.buttons}>
            <Button
              color="primary"
              variant="contained"
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button color="red" variant="contained" startIcon={<DeleteIcon />}>
              Delete
            </Button>
            <Button
              color="secondary"
              variant="contained"
              startIcon={<CloudUploadIcon />}
            >
              Upload
            </Button>
          </div>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: "flex",
    justifyContent: "space-around",
  },
  fields: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    // alignItems: "",
  },
}));

const getData = () => {
  const query = `query getPodcastEpisode($id: ID) {
  allPodcastEpisode(id: $id) {
    edges {
      node {
        id
        audio {
          data
        }
      }
    }
  }
}`;

  fetch("http://localhost:5000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        id: "UG9kY2FzdEVwaXNvZGU6NWY3YThjYzAyZDYzMzVlMDczMzcwOGVl",
      },
    }),
  })
    .then((r) => r.json())
    .then((data) => console.log("data returned:", data));
};
