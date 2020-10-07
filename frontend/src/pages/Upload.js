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
import Page from "../common/Page";
import theme from "../theme";

export default function Upload() {
  const classes = useStyles();

  // ! State management should always be done in the top-level component :)
  const [state, setState] = useState({
    image: "http://placehold.jp/150x150.png",
    allPodcasts: [],
    podcast: {
      label: "",
      value: "",
    },
    audioFile: "",
    title: "",
    description: "",
  });

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
          });
        }

        setState((prevState) => ({
          ...prevState,
          allPodcasts: names,
        }));
      });
  };

  console.log(state);

  return (
    <Page>
      <Grid container className={classes.center}>
        <Grid item xs={12} sm={4}>
          <Box mr={2}>
            <Preview
              image={state.image}
              title={state.title}
              description={state.description}
              podcast={state.podcast.label}
              episode={state.allPodcasts.length + 1}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={8} lg={6}>
          <h2>Upload your next episode</h2>
          <Paper>
            <Box p={5} my={3}>
              <Fields
                image={state.image}
                allPodcasts={state.allPodcasts}
                podcast={state.podcast}
                setState={setState}
              />
            </Box>
          </Paper>
          <Actions state={state} />
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

const Preview = ({ image, title, description, podcast, episode }) => {
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
            Episode {episode}: {title}
          </Typography>
        </Box>
        <Box mx={3}>
          <Typography variant="caption" display="block">
            Length: 24min
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

const Fields = ({ image, allPodcasts, setState }) => {
  const classes = useStyles();

  const handleChange = (event) => {
    setState((prevState) => ({
      ...prevState,
      [event.target.id]: event.target.value,
    }));
  };

  const handlePodcast = (event) => {
    const podcastItem = allPodcasts.filter((item) => {
      return item.value === event.target.value ? true : false;
    });

    setState((prevState) => ({
      ...prevState,
      podcast: podcastItem[0],
    }));
  };

  const handleAudio = (event) => {
    if (!event.target.files) {
      return;
    }

    setState((prevState) => ({
      ...prevState,
      audioFile: event.target.files[0],
    }));
  };

  return (
    <form className={classes.fields} noValidate autoComplete="off">
      <div className={classes.mediaContainer}>
        {/* TODO image upload */}
        <CardMedia
          className={classes.media}
          image={image}
          title="Upload podcast image"
        />
        <CardContent className={classes.mediaText}>
          <Typography gutterBottom variant="h6">
            Image Guidelines
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your cover image should be at least 150px x 150px. For best results,
            use a square image.
          </Typography>
        </CardContent>
      </div>
      <TextField
        id="title"
        label="Title"
        fullWidth
        variant="outlined"
        onBlur={handleChange}
      />
      <TextField
        id="description"
        multiline
        fullWidth
        rows={3}
        style={{ margin: `${theme.spacing(3)}px 0px` }}
        variant="outlined"
        label="Description"
        onBlur={handleChange}
      />
      <TextField
        id="podcast"
        variant="outlined"
        select
        fullWidth
        onChange={handlePodcast}
        label="Podcast Series"
      >
        {allPodcasts.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            data-name={option.label}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <input type="file" id="audio" onChange={handleAudio} />
    </form>
  );
};

// Cancel, submit and upload actions
const Actions = ({ state }) => {
  const classes = useStyles();

  const createPodcast = () => {
    console.log(state);
    const query = `mutation createPodcast($podcast: String, $title: String, $description: String, $audioFile: Upload!) {
      createPodcastEpisode(podcastMetadataId: $podcast, name: $title, description: $description, audio: $audioFile) {
        podcastMetadata {
            name
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
          podcast: state.podcast.value,
          title: state.title,
          description: state.description,
          audioFile: state.audioFile,
        },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        console.log(data);
      });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} className={classes.center}>
        <Button color="primary" variant="contained" startIcon={<CancelIcon />}>
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
