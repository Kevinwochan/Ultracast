import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import React, { useState } from "react";
import { uid } from "react-uid";
import theme from "../theme";
import { PodcastCover } from "./Podcast";

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    width: 150,
    height: 150,
  },
  podcast: {
    padding: theme.spacing(5),
  },
  header: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
  },
  actionContainer: {
    display: "inline-grid",
    gridGap: theme.spacing(2),
  },
}));

// https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
const toHHMMSS = (secs) => {
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  var seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};

export default function EditEpisodeList({
  episodes,
  updateEp,
  deleteEp,
  setSnackbar,
}) {
  const classes = useStyles();
  const [editing, setEditing] = useState(
    new Array(episodes.length).fill(false)
  );
  const [epInfo, setInfo] = useState({
    title: null,
    description: null,
    audio: {
      file: null,
      name: null,
    },
  });
  const updateEpInfo = (event) => {
    const value = event.target.value;
    const field = event.target.name;

    setInfo((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const updateAudio = (event) => {
    const audio = event.target.files[0];
    const fileType = audio.name.substr(audio.name.length - 3);

    if (fileType !== "mp3") {
      setSnackbar({
        message: "Please use a MP3 file only.",
        severity: "error",
        open: true,
      });
      return;
    }

    setInfo((prevState) => ({
      ...prevState,
      audio: {
        file: audio,
        name: audio.name,
      },
    }));
  };

  const editButtonHandler = (index) => {
    if (editing[index] === true) {
      // Save the new episode info
      const onSuccessEffect = () => {
        const editList = [...editing];
        editList[index] = false;
        setEditing(editList);
        setSnackbar((prevState) => ({
          message: `Episode updated successfully!`,
          severity: "success",
          open: true,
        }));
      };

      updateEp(
        {
          id: episodes[index].id,
          name: epInfo.title,
          description: epInfo.description,
          audio: epInfo.audio.file,
        },
        onSuccessEffect
      );
    } else if (editing.includes(true)) {
      // Another podcast is being editing right now
      setSnackbar((prevState) => ({
        message: `Please save the other episode details first!`,
        severity: "error",
        open: true,
      }));
    } else {
      // Update the editing list
      const editList = [...editing];
      editList[index] = true;
      setEditing(editList);
    }
  };

  return (
    <TableContainer>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell variant="head">#</TableCell>
            <TableCell variant="head">Cover</TableCell>
            <TableCell variant="head">Info</TableCell>
            <TableCell variant="head">Length</TableCell>
            <TableCell variant="head">Uploaded</TableCell>
            <TableCell variant="head"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {episodes === "loader" ? (
            <TableRow>
              <TableCell></TableCell>
              <TableCell>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            episodes.map((episode, index) => (
              <TableRow key={uid(episode)}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <PodcastCover episode={episode} creator />
                </TableCell>
                <TableCell>
                  {editing[index] ? (
                    <>
                      <TextField
                        name="title"
                        fullWidth
                        variant="outlined"
                        label="Podcast Title"
                        defaultValue={episode.title}
                        onBlur={updateEpInfo}
                      />
                      <TextField
                        name="description"
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                        label="Podcast Description"
                        style={{ marginTop: theme.spacing(2) }}
                        defaultValue={episode.description}
                        onBlur={updateEpInfo}
                      />
                    </>
                  ) : (
                    <>
                      <Typography>
                        <b>{episode.title}</b>
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {episode.description}
                      </Typography>
                    </>
                  )}
                </TableCell>
                <TableCell>
                  {editing[index] ? (
                    <div>
                      <div style={{ marginBottom: theme.spacing(2) }}>
                        <Button variant="contained" component="label">
                          <Typography gutterBottom variant="button">
                            Update audio track
                          </Typography>
                          <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={updateAudio}
                          />
                        </Button>
                      </div>
                      <div hidden={epInfo.audio.file === null}>
                        <CheckIcon fontSize="small" /> {epInfo.audio.name}
                      </div>
                    </div>
                  ) : (
                    toHHMMSS(episode.length)
                  )}
                </TableCell>
                <TableCell>{episode.date.toDateString()}</TableCell>
                <TableCell>
                  <div className={classes.actionContainer}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={editing[index] ? <SaveIcon /> : <EditIcon />}
                      onClick={() => {
                        editButtonHandler(index);
                      }}
                    >
                      {editing[index] ? "Save" : "Edit"}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ backgroundColor: theme.palette.error.main }}
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        deleteEp(episode.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
