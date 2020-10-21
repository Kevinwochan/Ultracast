import React, { useState, useEffect } from "react";
import { Button, makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CancelIcon from "@material-ui/icons/Cancel";
import DeleteIcon from "@material-ui/icons/Delete";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import Fade from "@material-ui/core/Fade";
import CircularProgress from "@material-ui/core/CircularProgress";
import CheckIcon from "@material-ui/icons/Check";
import theme from "../theme";
import { extractFiles } from "extract-files";
import axios from "axios";
import configuration from "../api/configuration";
import getDominantColour from "../common/dominantColor";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  fields: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
  },
  mediaContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "start",
    marginBottom: theme.spacing(2),
  },
  media: {
    height: 150,
    width: 150,
    border: "medium solid black",
  },
  mediaText: {
    maxWidth: 300,
  },
  center: {
    display: "flex",
    justifyContent: "center",
  },
  preview: {
    // minHeight: "calc(100vh - 70px)",
    minHeight: "100vh",
    // overflow: "hidden",
    // minHeight: "calc(100vh - ${theme.navBar.height})",
    background: "#e0e0e0",
  },
  previewHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

export default function Upload() {
  const classes = useStyles();
  const originalState = {
    image: "/branding/square.svg",
    allPodcasts: [{ label: "Create new podcast", value: "new-podcast" }],
    podcast: {
      label: "",
      value: "",
    },
    audioFile: null,
    duration: "",
    title: "",
    description: "",
    isNewPodcast: false,
    status: 0,
  };

  // ! State management should always be done in the top-level component :)
  const [state, setState] = useState(originalState);

  useEffect(() => {
    getPodcasts();
  }, []);

  const getPodcasts = () => {
    axios
      .post(
        configuration.BACKEND_ENDPOINT,
        JSON.stringify({
          query: `query($author: ID!) {allPodcastMetadata(author: $author) {
            edges {
              node {
                id
                name
                author {
                  id
                }
              }
            }
          }
        }`,
          variables: {
            author: "VXNlcjo1Zjg1OWQ1YzlkNzZjNDcyYWZhZTNlYTI=",
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
        let podcasts = [];
        response.data.data.allPodcastMetadata.edges.forEach((item) => {
          podcasts.push({
            value: item.node.id,
            label: item.node.name,
            author: item.node.author.id,
          });
        });
        setState((prevState) => ({
          ...prevState,
          allPodcasts: prevState.allPodcasts.concat(podcasts),
        }));
        console.log("fetched podcasts");
        console.log(podcasts);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const resetFields = () => {
    setState(originalState);
  };

  return (
    <Grid container className={`${classes.center} ${classes.container}`}>
      <Grid item xs={12} sm={8} lg={6}>
        <Paper>
          <Box p={5} my={3}>
            <Fields state={state} setState={setState} />
          </Box>
        </Paper>
        <Actions state={state} resetFields={resetFields} setState={setState} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Fade in={state.title ? true : false} timeout={750}>
          <Box ml={2} mt={-2}>
            <Preview
              image={state.image}
              title={state.title}
              description={state.description}
              podcast={state.podcast.label}
              duration={state.duration}
            />
          </Box>
        </Fade>
      </Grid>
    </Grid>
  );
}

const Preview = ({ image, title, description, podcast, duration }) => {
  const classes = useStyles();

  return (
    <Card variant="outlined" className={classes.preview}>
      <Box mt={7}>
        <div className={classes.previewHeader}>
          <img
            className={classes.media}
            src={image}
            alt="Preview podcast image"
            onLoad={(e) => {
              const img = e.target;
              const colour = getDominantColour(img);

              // It's gross i know :(
              img.parentElement.parentElement.parentElement.style.background = `#${colour}`;
            }}
          />
          <CardContent className={classes.mediaText}>
            <Typography variant="h6" align="center">
              {podcast}
            </Typography>
          </CardContent>
        </div>
        <Box mx={3} mt={1}>
          <Typography variant="h5" align="left" display="block">
            Latest Episode: {title}
          </Typography>
        </Box>
        <Box mx={3}>
          <Typography variant="caption" display="block">
            {duration !== "" ? `Length: ${duration}` : ""}
          </Typography>
        </Box>
        <Box m={3}>
          <Typography variant="body1" align="left" display="block">
            {description}
          </Typography>
        </Box>
      </Box>
      {/* TODO: add reccomendations here */}
    </Card>
  );
};

const Fields = ({ state, setState }) => {
  const allPodcasts = state.allPodcasts;
  const classes = useStyles();

  const handleChange = (event) => {
    const { id, value } = event.target;

    setState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handlePodcast = (event) => {
    const value = event.target.value;
    const podcastItem = allPodcasts.filter((item) => {
      return item.value === value ? true : false;
    });

    setState((prevState) => ({
      ...prevState,
      isNewPodcast: value === "new-podcast",
      podcast: podcastItem[0],
    }));
  };

  const handleAudio = (event) => {
    const file = event.target.files[0];

    // TODO make this a component that changes back on the cancel action event
    const button = event.target.parentElement;
    button.children[0].innerText = "Audio Track Uploaded!";
    button.style.background = "#4bb543";
    button.parentElement.style.background = "#4bb543";
    button.style.color = "#fff";

    // Get the length of the video
    var vid = document.createElement("video");
    var fileURL = URL.createObjectURL(file);
    vid.src = fileURL;
    vid.ondurationchange = function () {
      const minutes = Math.floor(this.duration / 60);
      setState((prevState) => ({
        ...prevState,
        duration: `${minutes} min`,
      }));
    };

    setState((prevState) => ({
      ...prevState,
      audioFile: file,
    }));
  };

  return (
    <form className={classes.fields} noValidate autoComplete="off">
      <div className={classes.mediaContainer}>
        {/* TODO image upload */}
        <CardMedia
          className={classes.media}
          image={state.image}
          title="Upload podcast image"
        />
        <CardContent className={classes.mediaText}>
          <Typography gutterBottom variant="subtitle1">
            Image Guidelines
          </Typography>
          <Typography variant="body2" color="textSecondary">
            - Use a 150px x 150px image. <br />- File type should be either PNG
            or JPEG
          </Typography>
        </CardContent>
      </div>
      <TextField
        id="podcast"
        variant="outlined"
        select
        fullWidth
        value={state.podcast.value || ""}
        style={{ margin: `${theme.spacing(3)}px 0px` }}
        onChange={handlePodcast}
        label="Podcast Series"
      >
        {allPodcasts.map((podcast) => (
          <MenuItem key={podcast.label} value={`${podcast.value}`}>
            {podcast.label}
          </MenuItem>
        ))}
      </TextField>
      {state.isNewPodcast && (
        <>
          <TextField
            id="podcastTitle"
            fullWidth
            variant="outlined"
            label="New Podcast Title"
            onChange={handleChange}
          />
          <TextField
            id="podcastDescription"
            multiline
            fullWidth
            rows={3}
            style={{ margin: `${theme.spacing(3)}px 0px` }}
            variant="outlined"
            label="Podcast Description"
            onChange={handleChange}
          />
        </>
      )}
      <TextField
        id="title"
        label="Title"
        fullWidth
        variant="outlined"
        value={state.title}
        onChange={handleChange}
      />
      <TextField
        id="description"
        multiline
        fullWidth
        rows={3}
        style={{ margin: `${theme.spacing(3)}px 0px` }}
        variant="outlined"
        label="Description"
        value={state.description}
        onChange={handleChange}
      />
      <Button
        variant="contained"
        component="label"
        style={{ marginTop: theme.spacing(3) }}
      >
        <Typography gutterBottom variant="button">
          Upload audio track
        </Typography>

        <input type="file" style={{ display: "none" }} onChange={handleAudio} />
      </Button>
    </form>
  );
};

// Cancel, submit and upload actions
const Actions = ({ state, resetFields, setState }) => {
  const classes = useStyles();

  const uploadPodcast = () => {
    const fetchOptions = graphqlFetchOptions({
      query: `
      mutation ($author: ID! $name: String! $description: String) {
        createPodcastMetadata (input: {
          author: $author
          name: $name
          description: $description
        }) {
          success
          podcastMetadata {
            id
            name
          }
        }
      }
      `,
      variables: {
        name: state.podcastTitle,
        author:
          "VXNlcjo1Zjg1OWQ1YzlkNzZjNDcyYWZhZTNlYTI=" /* TODO: dynamic authors */,
        description: state.podcastDescription,
        /* TODO: add categories and keywords */
      },
    });
    fetch(configuration.BACKEND_ENDPOINT, fetchOptions)
      .then((r) => r.json())
      .then((data) => {
        if (data.errors) {
          throw data.errors;
        } else {
          console.log(`Podcast created`);

          const fetchOptions = graphqlFetchOptions({
            query: `mutation ($podcast: ID!, $title: String, $description: String, $audioFile: Upload!) {
              createPodcastEpisode(input: {audio: $audioFile, description: $description, name: $title,  podcastMetadataId: $podcast}) {
                podcastMetadata {
                  id
                  name
                }
              }
            }`,
            variables: {
              podcast: data.data.createPodcastMetadata.podcastMetadata.id,
              title: state.title,
              description: state.description,
              audioFile: state.audioFile,
            },
          });
          fetch(configuration.BACKEND_ENDPOINT, fetchOptions)
            .then((r) => r.json())
            .then((data) => {
              if (data.errors) {
                throw data.errors;
              } else {
                console.log(
                  `Episode added to ${data.data.createPodcastEpisode.podcastMetadata.name}`
                );
                console.log(data);
                setState((prevState) => ({
                  ...prevState,
                  status: 2,
                }));
              }
            });
        }
      });
  };

  const uploadEpisode = () => {
    setState((prevState) => ({
      ...prevState,
      status: 1,
    }));
    if (state.isNewPodcast) {
      uploadPodcast();
    } else {
      const fetchOptions = graphqlFetchOptions({
        query: `mutation ($podcast: ID!, $title: String, $description: String, $audioFile: Upload!) {
          createPodcastEpisode(input: {audio: $audioFile, description: $description, name: $title,  podcastMetadataId: $podcast}) {
            podcastMetadata {
              id
              name
            }
          }
        }`,
        variables: {
          podcast: state.podcast.value,
          title: state.title,
          description: state.description,
          audioFile: state.audioFile,
        },
      });
      fetch(configuration.BACKEND_ENDPOINT, fetchOptions)
        .then((r) => r.json())
        .then((data) => {
          if (data.errors) {
            throw data.errors;
          } else {
            console.log(
              `Episode added to ${data.data.createPodcastEpisode.podcastMetadata.name}`
            );
            console.log(data);
            setState((prevState) => ({
              ...prevState,
              status: 2,
            }));
          }
        });
    }
  };

  const deletePodcast = () => {
    /* TODO: implement this
     */
  };

  switch (state.status) {
    case 1:
      return <CircularProgress />;
    case 2:
      return (
        <Button color="secondary" variant="contained" endIcon={<CheckIcon />}>
          SUCCESS
        </Button>
      );
    default:
      return (
        <Grid container spacing={3}>
          <Grid item lg className={classes.center}>
            <Button
              color="primary"
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={deletePodcast}
            >
              <Typography variant="button">Delete</Typography>
            </Button>
          </Grid>
          <Grid item lg className={classes.center}>
            <Button
              color="primary"
              variant="contained"
              startIcon={<CancelIcon />}
              onClick={resetFields}
            >
              <Typography variant="button">Cancel</Typography>
            </Button>
          </Grid>
          <Grid item lg className={classes.center}>
            <Button
              color="primary"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={uploadEpisode}
            >
              <Typography variant="button">Upload</Typography>
            </Button>
          </Grid>
        </Grid>
      );
  }
};

// Taken from:
// https://github.com/jaydenseric/graphql-react/blob/1b1234de5de46b7a0029903a1446dcc061f37d09/src/universal/graphqlFetchOptions.mjs
function graphqlFetchOptions(operation) {
  const fetchOptions = {
    url: configuration.BACKEND_ENDPOINT,
    method: "POST",
    headers: { Accept: "application/json" },
  };

  const { clone, files } = extractFiles(operation);
  const operationJSON = JSON.stringify(clone);

  if (files.size) {
    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    const form = new FormData();

    form.append("operations", operationJSON);

    const map = {};
    let i = 0;
    files.forEach((paths) => {
      map[++i] = paths;
    });
    form.append("map", JSON.stringify(map));

    i = 0;
    files.forEach((paths, file) => {
      form.append(`${++i}`, file, file.name);
    });

    fetchOptions.body = form;
  } else {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = operationJSON;
  }

  return fetchOptions;
}
