import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import MenuItem from "@material-ui/core/MenuItem";
import CheckIcon from "@material-ui/icons/Check";
import theme from "../theme";
import { getUserPodcasts } from "../api/query";
import { newPodcast, updatePodcast, newEpisode } from "../api/mutation";
import Spinner from "../components/Spinner";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  button: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  page: {
    margin: theme.spacing(2),
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const steps = ["Select a podcast", "Episode details", "Upload"];

function getStepContent(step, fieldState, handleNext, handleBack) {
  switch (step) {
    case 0:
      // Select a podcast
      return <SelectPodcast fieldState={fieldState} />;
    case 1:
      // Episode details
      return <UploadEpisode fieldState={fieldState} />;
    case 2:
      // Upload
      return (
        <Confirmation
          fieldState={fieldState}
          handleNext={handleNext}
          handleBack={handleBack}
        />
      );
    default:
      return "Unknown step";
  }
}

export default function Upload() {
  const classes = useStyles();
  const [cookies] = useCookies(["token"]);
  const [activeStep, setActiveStep] = useState(0);
  const fieldState = useState({
    podcast: {
      cover: "/branding/square.svg",
      id: "",
      title: "",
      description: "",
      category: "",
      subcategory: "",
      keywords: [""],
    },
    episode: {
      audio: {
        file: null,
        duration: "",
        name: "",
      },
      title: "",
      description: "",
      keywords: [""],
    },
    snackbar: {
      message: "",
      severity: "info",
      open: false,
    },
    allPodcasts: [
      {
        title: "New podcast",
        id: "new-podcast",
        cover: "/branding/square.svg",
      },
    ],
    isNewPodcast: false,
    status: 0,
    token: cookies.token,
  });
  const [fields, setFields] = fieldState;

  // Returns true if there is an error
  function checkPodcast() {
    if (fields.podcast.title === "") {
      if (fields.podcast.id !== "") {
        // New podcast was selected, but the title was cleared
        setFields((prevState) => ({
          ...prevState,
          snackbar: {
            message: "Please enter a name for your new podcast.",
            severity: "error",
            open: true,
          },
        }));
      } else {
        // No podcast has been selected yet
        setFields((prevState) => ({
          ...prevState,
          snackbar: {
            message: "Please select a podcast series first!",
            severity: "error",
            open: true,
          },
        }));
      }

      return true;
    }

    return false;
  }

  // Returns true if there is an error
  function checkEpisode() {
    if (
      fields.episode.title === "" ||
      fields.episode.description === "" ||
      fields.episode.audio.file === null
    ) {
      setFields((prevState) => ({
        ...prevState,
        snackbar: {
          message: "Please fill all the fields.",
          severity: "error",
          open: true,
        },
      }));

      return true;
    }
    return false;
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      let hasError;
      switch (prevActiveStep) {
        case 0:
          hasError = checkPodcast();
          break;
        case 1:
          hasError = checkEpisode();
          break;
        default:
          hasError = false;
      }

      if (!hasError && prevActiveStep === 1) {
        // We're ready to upload!
        setFields((prevState) => ({
          ...prevState,
          status: 1,
        }));
      }

      return hasError ? prevActiveStep : prevActiveStep + 1;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const history = useHistory();
  const handleReset = () => {
    history.go(0);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setFields((prevState) => ({
      ...prevState,
      snackbar: {
        ...prevState.snackbar,
        open: false,
      },
    }));
  };

  // Add all the podcasts the user has created already
  useEffect(() => {
    getUserPodcasts(cookies.token).then((podcasts) => {
      setFields((prevState) => ({
        ...prevState,
        allPodcasts: prevState.allPodcasts.concat(podcasts),
      }));
    });
  }, [cookies.token, setFields]);

  return (
    <Grid container>
      <Box mt={2} ml={2}>
        <Typography gutterBottom variant="h5">
          <b>Upload your next sensation</b>
        </Typography>
      </Box>

      <div className={classes.root}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mx={5}>
          <Snackbar
            open={fields.snackbar.open}
            autoHideDuration={6000}
            onClose={handleClose}
          >
            <Alert onClose={handleClose} severity={fields.snackbar.severity}>
              {fields.snackbar.message}
            </Alert>
          </Snackbar>
          {activeStep === steps.length ? (
            <div>
              <Typography className={classes.page}>
                All done! Thank you for using UltraCast.
              </Typography>
              <Button onClick={handleReset} className={classes.button}>
                Upload another
              </Button>
            </div>
          ) : (
            <>
              <Box mt={2}>
                <form noValidate autoComplete="off">
                  {getStepContent(
                    activeStep,
                    fieldState,
                    handleNext,
                    handleBack
                  )}
                </form>
              </Box>
              <div>
                <Button
                  disabled={activeStep === 0 || activeStep === steps.length - 1}
                  onClick={handleBack}
                  className={classes.button}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                  disabled={activeStep === steps.length - 1}
                >
                  {activeStep === steps.length - 2 ? "Upload" : "Next"}
                </Button>
              </div>
            </>
          )}
        </Box>
      </div>
    </Grid>
  );
}

const selectPodcastStyle = makeStyles({
  root: {
    marginBottom: 32,
    display: "flex",
  },
  fieldContainer: {
    width: "50%",
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
  preview: {
    width: "40%",
    marginLeft: "5%",
    background: "#e0e0e0",
  },
  previewHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
});

const SelectPodcast = ({ fieldState }) => {
  const classes = selectPodcastStyle();
  const [fields, setFields] = fieldState;
  const allPodcasts = fields.allPodcasts;

  const handlePodcastSelection = (event) => {
    const value = event.target.value;
    const podcastItem = allPodcasts.filter((item) => {
      return item.id === value ? true : false;
    });

    setFields((prevState) => ({
      ...prevState,
      isNewPodcast: value === "new-podcast",
      podcast: {
        ...prevState.podcast,
        ...podcastItem[0],
      },
    }));
  };

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFields((prevState) => ({
      ...prevState,
      podcast: {
        ...prevState.podcast,
        [id]: value,
      },
    }));
  };

  const handleCoverImage = (event) => {
    const button = event.target.parentElement;
    const image = event.target.files[0];

    // Temporarily hide the button
    button.style.display = "none";

    // Create a new podcast with temporary details
    newPodcast(
      {
        name: "temp-name",
        description: "",
        cover: image,
        category: "",
        subCategory: "",
        keywords: [""],
      },
      fields.token
    ).then((data) => {
      // Show the button again
      button.style.display = "inherit";

      if (data.success) {
        setFields((prevState) => ({
          ...prevState,
          podcast: {
            ...prevState.podcast,
            cover: data.podcastMetadata.coverUrl,
          },
          tempPodcastId: data.podcastMetadata.id,
          snackbar: {
            message: "Cover image upload successful",
            severity: "success",
            open: true,
          },
        }));
      } else {
        setFields((prevState) => ({
          ...prevState,
          snackbar: {
            message: "Could not upload cover image. Please try again.",
            severity: "error",
            open: true,
          },
        }));
      }
    });
  };

  // TODO: add categories, subcategories and keywords

  return (
    <div className={classes.root}>
      <div className={classes.fieldContainer}>
        <TextField
          id="podcast"
          variant="outlined"
          select
          fullWidth
          value={fields.podcast.id || ""}
          style={{ margin: `${theme.spacing(3)}px 0px` }}
          onChange={handlePodcastSelection}
          label="Podcast Series"
        >
          {allPodcasts.map((podcast) => (
            <MenuItem key={podcast.title} value={`${podcast.id}`}>
              {podcast.title}
            </MenuItem>
          ))}
        </TextField>
        {fields.isNewPodcast && (
          <>
            <div className={classes.mediaContainer}>
              <CardMedia
                className={classes.media}
                image={fields.podcast.cover}
                title="Your cover image"
              />
              <CardContent className={classes.mediaText}>
                <Typography gutterBottom variant="subtitle1">
                  Image Guidelines
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  - Use a 150px x 150px image. <br />- File type should be
                  either PNG or JPEG
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  style={{ marginTop: theme.spacing(2) }}
                >
                  <Typography gutterBottom variant="button">
                    Upload podcast cover
                  </Typography>

                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleCoverImage}
                  />
                </Button>
              </CardContent>
            </div>
            <TextField
              id="title"
              fullWidth
              variant="outlined"
              label="New Podcast Title"
              value={fields.podcast.title}
              onChange={handleChange}
            />
            <TextField
              id="description"
              multiline
              fullWidth
              rows={3}
              style={{ margin: `${theme.spacing(3)}px 0px` }}
              variant="outlined"
              label="Podcast Description"
              onChange={handleChange}
            />
            <TextField
              id="category"
              fullWidth
              variant="outlined"
              label="Category"
              value={fields.podcast.category}
              onChange={handleChange}
            />
          </>
        )}
      </div>
      <PodcastPreview
        hidden={fields.podcast.title === ""}
        image={fields.podcast.cover}
        title={fields.podcast.title}
        description={fields.podcast.description}
      />
    </div>
  );
};

const PodcastPreview = ({ hidden, image, title, description }) => {
  const classes = selectPodcastStyle();

  return (
    <Card hidden={hidden} variant="outlined" className={classes.preview}>
      <Box mt={7}>
        <div className={classes.previewHeader}>
          <img
            onError={(e) => {
              e.target.src = `/branding/square.svg`;
            }}
            className={classes.media}
            src={image}
            alt="Preview podcast"
          />
          <CardContent className={classes.mediaText}>
            <Typography variant="h6" align="center">
              {title}
            </Typography>
          </CardContent>
        </div>
        <Box m={3}>
          <Typography variant="body1" align="left" display="block">
            {description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

const uploadEpisodeStyle = makeStyles({
  root: {
    display: "flex",
  },
  fieldContainer: {
    width: "50%",
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
  preview: {
    width: "40%",
    marginLeft: "5%",
    background: "#e0e0e0",
  },
  previewHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
});

const UploadEpisode = ({ fieldState }) => {
  const classes = uploadEpisodeStyle();
  const [fields, setFields] = fieldState;

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFields((prevState) => ({
      ...prevState,
      episode: {
        ...prevState.episode,
        [id]: value,
      },
    }));
  };

  const handleAudio = (event) => {
    const file = event.target.files[0];

    // Get the length of the video
    var vid = document.createElement("video");
    var fileURL = URL.createObjectURL(file);
    vid.src = fileURL;
    vid.ondurationchange = function () {
      const minutes = Math.floor(this.duration / 60);
      setFields((prevState) => ({
        ...prevState,
        episode: {
          ...prevState.episode,
          audio: {
            ...prevState.episode.audio,
            duration: minutes,
          },
        },
      }));
    };

    setFields((prevState) => ({
      ...prevState,
      episode: {
        ...prevState.episode,
        audio: {
          ...prevState.episode.audio,
          file: file,
          name: file.name,
        },
      },
    }));
  };

  return (
    <div className={classes.root}>
      <div className={classes.fieldContainer}>
        <TextField
          id="title"
          label="Episode Title"
          fullWidth
          variant="outlined"
          value={fields.title}
          onChange={handleChange}
        />
        <TextField
          id="description"
          multiline
          fullWidth
          rows={3}
          style={{ margin: `${theme.spacing(3)}px 0px` }}
          variant="outlined"
          label="Episode Description"
          value={fields.description}
          onChange={handleChange}
        />
        <div
          className={classes.root}
          style={{ marginBottom: theme.spacing(3) }}
        >
          <div className={classes.fieldContainer}>
            <Button variant="contained" component="label">
              <Typography gutterBottom variant="button">
                Upload audio track
              </Typography>

              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleAudio}
              />
            </Button>
          </div>
          <div hidden={fields.episode.audio.file === null}>
            <CheckIcon fontSize="small" /> {fields.episode.audio.name}
          </div>
        </div>
      </div>
      <EpisodePreview
        image={fields.podcast.cover}
        podcast={fields.podcast.title}
        title={fields.episode.title}
        description={fields.episode.description}
        duration={fields.episode.audio.duration}
      />
    </div>
  );
};

const EpisodePreview = ({ image, title, description, podcast, duration }) => {
  const classes = uploadEpisodeStyle();

  return (
    <Card variant="outlined" className={classes.preview}>
      <Box mt={7}>
        <div className={classes.previewHeader}>
          <img
            onError={(e) => {
              e.target.src = `/branding/square.svg`;
            }}
            className={classes.media}
            src={image}
            alt="Preview podcast"
            onLoad={(e) => {
              // TODO fix this
              // const img = e.target;
              // img.src = image + "?" + new Date().getTime();
              // img.setAttribute("crossOrigin", "Anonymous");
              // const colour = getDominantColour(img);

              // // It's gross i know :(
              // img.parentElement.parentElement.parentElement.style.background = `#${colour}`;
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
            {duration !== "" ? `Length: ${duration} min` : ""}
          </Typography>
        </Box>
        <Box m={3}>
          <Typography variant="body1" align="left" display="block">
            {description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

const confirmationStyle = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});

/**
 * Create a new podcast and episode for the user.
 * This only happens if the user didn't upload a cover image for their podcast.
 *
 * @param {List} fieldState fields and setFields state for this component
 * @param {Function} handleNext
 * @param {Function} handleBack
 */
async function createNewPodcastAndEpisode(fields) {
  // Create a new podcast first
  const data = await newPodcast(
    {
      name: fields.podcast.title,
      description: fields.podcast.description,
      category: fields.podcast.category,
      subCategory: fields.podcast.subcategory,
      keywords: fields.podcast.keywords,
    },
    fields.token
  );
  if (data.success) {
    return createNewEpisode(data.podcastMetadata.id, fields);
  } else {
    return false;
  }
}

/**
 * Updates a podcast and creates a new episode for it.
 * Expected to be called if a temporary podcast was made with only a cover photo
 *
 * @param {String} podcastId the podcast ID
 * @param {List} fieldState fields state for this component
 */
async function updatePodcastCreateEpisode(podcastID, fields) {
  // Update the temporary podcast details
  const data = await updatePodcast(
    {
      id: podcastID,
      name: fields.podcast.title,
      description: fields.podcast.description,
      category: fields.podcast.category,
      subCategory: fields.podcast.subcategory,
      keywords: fields.podcast.keywords,
    },
    fields.token
  );
  if (data.success) {
    return createNewEpisode(podcastID, fields);
  } else {
    return false;
  }
}

/**
 * Creates a new podcast episode given the podcast ID
 *
 * @param {String} podcastId the podcast ID
 * @param {List} fields fields state for this component
 */
async function createNewEpisode(podcastId, fields) {
  const success = await newEpisode(
    {
      id: podcastId,
      name: fields.episode.title,
      description: fields.episode.description,
      audio: fields.episode.audio.file,
      keywords: fields.episode.keywords,
    },
    fields.token
  );

  return success;
}

const Confirmation = ({ fieldState, handleNext, handleBack }) => {
  const classes = confirmationStyle();
  const [fields, setFields] = fieldState;
  let mutation;

  // Status of 1 means we're ready to upload
  if (fields.status === 1) {
    if (fields.podcast.id === "new-podcast") {
      if (fields.tempPodcastId) {
        mutation = updatePodcastCreateEpisode(fields.tempPodcastId, fields);
      } else {
        mutation = createNewPodcastAndEpisode(fields);
      }
    } else {
      mutation = createNewEpisode(fields.podcast.id, fields);
    }

    mutation.then((success) => {
      if (success) {
        setFields((prevState) => ({
          ...prevState,
          snackbar: {
            message: "Upload successful!",
            severity: "success",
            open: true,
          },
          status: 0,
        }));
      } else {
        setFields((prevState) => ({
          ...prevState,
          snackbar: {
            message: "Could not upload. Please try again.",
            severity: "error",
            open: true,
          },
          status: 0,
        }));
      }
    });
  }

  useEffect(() => {
    // Once the mutation has resolved, go forward or backward
    if (fields.status === 0) {
      if (fields.snackbar.severity === "success") {
        handleNext();
      } else if (fields.snackbar.severity === "error") {
        handleBack();
      }
    }
  }, [fields.snackbar.severity, fields.status, handleBack, handleNext]);

  return (
    <div className={classes.root}>
      <Typography>Please wait while we upload your episode.</Typography>
      <Spinner />
    </div>
  );
};
