import React, { useState, useEffect } from "react";
import { Button, makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CancelIcon from "@material-ui/icons/Cancel";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import Fade from "@material-ui/core/Fade";
import Page from "../common/Page";
import theme from "../theme";
import { extractFiles } from "extract-files";

export default function Upload() {
  const classes = useStyles();
  const originalState = {
    image: "http://placehold.jp/150x150.png",
    allPodcasts: [],
    podcast: {
      label: "",
      value: "",
    },
    audioFile: null,
    duration: "",
    title: "",
    description: "",
  };

  // ! State management should always be done in the top-level component :)
  const [state, setState] = useState(originalState);

  useEffect(() => {
    getPodcastNames();
  }, []);

  const getPodcastNames = () => {
    const query = `query getPodcastNames {
      allPodcastMetadata {
        edges {
          node{
            id
            name
            description
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
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const names = [];
        for (const item of data.data.allPodcastMetadata.edges) {
          names.push({
            value: item.node.id,
            label: item.node.name,
            description: item.node.description,
          });
        }

        setState((prevState) => ({
          ...prevState,
          allPodcasts: names,
        }));
      });
  };

  const resetFields = () => {
    setState(originalState);
  };

  return (
    <Page>
      <Grid container className={classes.center}>
        <Grid item xs={12} sm={8} lg={6}>
          <Box my={2}>
            <Typography variant="h5">
              <b>Upload your next episode</b>
            </Typography>
          </Box>
          <Paper>
            <Box p={5} mb={3}>
              <Fields state={state} setState={setState} />
            </Box>
          </Paper>
          <Actions state={state} resetFields={resetFields} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Fade in={state.title} timeout={750}>
            <Box ml={2}>
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
    </Page>
  );
}

const useStyles = makeStyles((theme) => ({
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
  },
  mediaText: {
    maxWidth: 300,
  },
  center: {
    display: "flex",
    justifyContent: "center",
  },
  preview: {
    height: "92vh",
    background:
      "linear-gradient(0deg, rgba(226,180,0,1) 0%, rgba(253,187,45,1) 25%)",
  },
  previewHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const Preview = ({ image, title, description, podcast, duration }) => {
  const classes = useStyles();

  return (
    <Card variant="outlined" className={classes.preview}>
      <Box mt={7}>
        <div className={classes.previewHeader}>
          <CardMedia
            className={classes.media}
            image={image}
            title="Preview podcast image"
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
    const { value } = event.target;
    const podcastItem = allPodcasts.filter((item) => {
      return item.value === value ? true : false;
    });

    setState((prevState) => ({
      ...prevState,
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
      <TextField
        id="podcast"
        variant="outlined"
        select
        fullWidth
        value={state.podcast.value || ""}
        onChange={handlePodcast}
        label="Podcast Series"
      >
        {allPodcasts.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
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
const Actions = ({ state, resetFields }) => {
  const classes = useStyles();

  const createPodcast = () => {
    const fetchOptions = graphqlFetchOptions({
      query: `mutation createPodcast($podcast: ID! $title: String $description: String $audioFile: Upload!) {
        createPodcastEpisode(podcastMetadataId: $podcast name: $title description: $description audio: $audioFile) {
          podcastMetadata {
            name
          }
        }
      }`,
      variables: {
        podcast: state.podcast.value,
        // podcast: "5f7d756d73f1b06154752d26",
        title: state.title,
        description: state.description,
        audioFile: state.audioFile,
      },
    });
    fetch("http://localhost:5000/graphql", fetchOptions)
      .then((r) => r.json())
      .then((data) => {
        if (data.errors) {
          throw data.errors;
        } else {
          console.log(
            `Episode added to ${data.data.createPodcastEpisode.podcastMetadata.name}`
          );
        }
      });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} className={classes.center}>
        <Button
          color="primary"
          variant="contained"
          startIcon={<CancelIcon />}
          onClick={resetFields}
        >
          <Typography variant="button">Cancel</Typography>
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} className={classes.center}>
        <Button
          color="secondary"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={createPodcast}
        >
          <Typography variant="button">Upload</Typography>
        </Button>
      </Grid>
    </Grid>
  );
};

// Taken from:
// https://github.com/jaydenseric/graphql-react/blob/1b1234de5de46b7a0029903a1446dcc061f37d09/src/universal/graphqlFetchOptions.mjs
function graphqlFetchOptions(operation) {
  const fetchOptions = {
    url: "http://localhost:5000/graphql",
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
