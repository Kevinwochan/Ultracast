import React from "react";
import { uid } from "react-uid";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";
import CircularProgress from "@material-ui/core/CircularProgress";
import BookmarkAccordian from "../components/BookmarkAccordian";
import { PodcastCover } from "./Podcast";
import { toHHMMSS } from "../common/utils";

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
  watched: {
    background: "rgba(0,0,0, 0.1)",
  },
  row: {
    verticalAlign: "top",
  },
}));

export default function Playlist({ episodes, state }) {
  const classes = useStyles();

  if (episodes.length === 0) {
    return <Typography variant="subtitle1">No episodes to display</Typography>;
  }

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
              <TableRow key={uid(episode)} className={classes.row}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <PodcastCover episode={episode} state={state} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      episode.watched !== undefined && !episode.watched
                        ? "dot"
                        : "standard"
                    }
                    color="error"
                  >
                    <Typography>
                      <b>{episode.title}</b>
                    </Typography>
                  </Badge>
                  <Typography variant="body2" gutterBottom>
                    {episode.description}
                  </Typography>
                  <BookmarkAccordian state={state} episode={episode} />
                </TableCell>
                <TableCell>{toHHMMSS(episode.length)}</TableCell>
                <TableCell>{episode.date.toDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
