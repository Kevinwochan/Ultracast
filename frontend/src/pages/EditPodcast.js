import { useCookies } from "react-cookie";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import MuiAlert from "@material-ui/lab/Alert";
import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  updatePodcast,
  deletePodcast,
  updateEpisode,
  deleteEpisode,
} from "../api/mutation";
import { getEpisodes } from "../api/query";
import EditEpisodeList from "../components/EditEpisodeList";
import { PodcastLoader } from "../components/Podcast";
import Spinner from "../components/Spinner";
import theme from "../theme";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  podcastTitle: {
    fontWeight: "bold",
  },
  podcastHero: {
    background: "white",
    padding: theme.spacing(5),
    marginBottom: theme.spacing(3),
    minHeight: 150,
  },
  podcastDescription: {
    lineHeight: "1.5rem",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  descriptionField: {
    margin: `${theme.spacing(3)}px 0px`,
    width: "50%",
  },
}));

export default function EditPodcast() {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const classes = useStyles();
  const { podcastId } = useParams();
  const history = useHistory();
  const [podcast, setPodcast] = useState("loader");
  const [episodes, setEpisodes] = useState([]);
  const [editing, setEdit] = useState(false);
  const [newInfo, setInfo] = useState({
    title: null,
    description: null,
    cover: {
      file: null,
      name: null,
    },
    sending: false,
  });
  const [snackbar, setSnackbar] = useState({
    message: "",
    severity: "info",
    open: false,
  });

  const editPodcast = () => {
    if (editing === true) {
      // Send the new podcast info to the server
      setInfo((prevState) => ({
        ...prevState,
        sending: true,
      }));
    } else {
      // Begin editing the podcast
      setEdit(true);
    }
  };

  const deletePodcastCallback = () => {
    setInfo((prevState) => ({
      ...prevState,
      sending: true,
    }));
    deletePodcast(podcastId, cookies.token).then((data) => {
      if (data.success) {
        history.push("/creators/podcasts/");
      } else {
        setSnackbar({
          message: "Could not delete podcast.",
          severity: "error",
          open: true,
        });
      }
    });
  };

  const updateNewInfo = (event) => {
    const value = event.target.value;
    const field = event.target.id;

    setInfo((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const updateCover = (event) => {
    const image = event.target.files[0];
    const fileType = image.name.substr(image.name.length - 3);

    if (fileType !== "png") {
      setSnackbar({
        message: "Please use a PNG image only.",
        severity: "error",
        open: true,
      });
      return;
    }

    setInfo((prevState) => ({
      ...prevState,
      cover: {
        file: image,
        name: image.name,
      },
    }));
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbar((prevState) => ({
      ...prevState,
      open: false,
    }));
  };

  const updateEp = (epInfo, onSuccess) => {
    updateEpisode(epInfo, cookies.token).then((data) => {
      if (data.success) {
        getEpisodes(podcastId).then((podcastInfo) => {
          setPodcast(podcastInfo.podcast);
          setEpisodes(podcastInfo.episodes);
          onSuccess();
        });
      } else {
        setSnackbar({
          message: "Could not update episode.",
          severity: "error",
          open: true,
        });
      }
    });
  };

  const deleteEp = (id) => {
    deleteEpisode(id, cookies.token).then((data) => {
      if (data.success) {
        setSnackbar({
          message: "Deleted episode.",
          severity: "success",
          open: true,
        });
        history.push(`/creators/podcasts/`);
      } else {
        setSnackbar({
          message: "Could not delete episode.",
          severity: "error",
          open: true,
        });
      }
    });
  };

  // Get the podcast and episode info
  useEffect(() => {
    getEpisodes(podcastId).then((podcastInfo) => {
      setPodcast(podcastInfo.podcast);
      setEpisodes(podcastInfo.episodes);
    });
  }, [podcastId]);

  // Send new podcast data to the server
  useEffect(() => {
    if (editing && newInfo.sending === true) {
      console.log(newInfo);
      updatePodcast(
        {
          id: podcastId,
          name: newInfo.title,
          description: newInfo.description,
          cover: newInfo.cover.file,
        },
        cookies.token
      ).then((data) => {
        if (data.success) {
          getEpisodes(podcastId).then((podcastInfo) => {
            setPodcast(podcastInfo.podcast);
            setEpisodes(podcastInfo.episodes);
            setEdit(false);
            setSnackbar({
              message: "Podcast updated!",
              severity: "success",
              open: true,
            });
            setInfo((prevState) => ({
              ...prevState,
              sending: false,
            }));
          });
        } else {
          console.log(data);
          setSnackbar({
            message: "Podcast could not be updated.",
            severity: "error",
            open: true,
          });
        }
      });
    }
  }, [podcastId, newInfo, editing]);

  if (podcast === "loader") {
    return (
      <Grid container className={classes.podcastHero}>
        <PodcastLoader />
      </Grid>
    );
  }

  return (
    <>
      <Box className={classes.podcastHero}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} md={6} lg={4}>
            {editing ? (
              <TextField
                id="title"
                fullWidth
                variant="outlined"
                label="Podcast Title"
                defaultValue={podcast.title}
                onBlur={updateNewInfo}
              />
            ) : (
              <>
                <Typography variant="subtitle2">PODCAST TITLE</Typography>
                <Typography variant="h4" className={classes.podcastTitle}>
                  {podcast.title}
                </Typography>
              </>
            )}
          </Grid>
          <Grid item xs>
            <Typography variant="subtitle2">NO. EPISODES</Typography>
            <Typography variant="subtitle2">{podcast.episodeCount}</Typography>
          </Grid>
        </Grid>
        {editing ? (
          <TextField
            id="description"
            multiline
            rows={3}
            className={classes.descriptionField}
            variant="outlined"
            label="Podcast Description"
            defaultValue={podcast.description}
            onBlur={updateNewInfo}
          />
        ) : (
          <Typography variant="body1" className={classes.podcastDescription}>
            {podcast.description}
          </Typography>
        )}
        {editing ? (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs style={{ flexGrow: 0.3 }}>
              <Button
                variant="contained"
                component="label"
                style={{ marginTop: theme.spacing(2) }}
              >
                <Typography gutterBottom variant="button">
                  Update podcast cover
                </Typography>

                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={updateCover}
                />
              </Button>
            </Grid>
            <Grid item xs>
              <div hidden={newInfo.cover.file === null}>
                <CheckIcon fontSize="small" /> {newInfo.cover.name}
              </div>
            </Grid>
          </Grid>
        ) : (
          ""
        )}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            {newInfo.sending ? (
              <Spinner />
            ) : (
              <Grid
                container
                spacing={2}
                alignItems="center"
                justify="space-evenly"
              >
                <Grid item>
                  <EditButton editing={editing} onClick={editPodcast} />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ backgroundColor: theme.palette.error.main }}
                    startIcon={<DeleteIcon />}
                    onClick={deletePodcastCallback}
                  >
                    Delete
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
      <Divider variant="fullWidth" />
      <EditEpisodeList
        episodes={episodes}
        updateEp={updateEp}
        deleteEp={deleteEp}
        setSnackbar={setSnackbar}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

const EditButton = ({ editing, onClick }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={editing ? <SaveIcon /> : <EditIcon />}
      onClick={onClick}
    >
      {editing ? "Save" : "Edit"}
    </Button>
  );
};
