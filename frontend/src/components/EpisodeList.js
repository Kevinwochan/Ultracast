import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
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
}));

// https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
// probably a better way but ceebs
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

export default function Playlist({ episodes, state }) {
  const classes = useStyles();

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
              <TableRow key={episode.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <PodcastCover episode={episode} state={state} />
                </TableCell>
                <TableCell>
                  <Typography>
                    <b>{episode.title}</b>
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {episode.description}
                  </Typography>
                </TableCell>
                <TableCell>{toHHMMSS(episode.length)}</TableCell>
                <TableCell>
                  {episode.date.toDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
