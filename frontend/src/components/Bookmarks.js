import React, { useState, useEffect } from "react";
import { uid } from "react-uid";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { toHHMMSS } from "../common/utils";
import { playNow } from "./AudioPlayer/Player";
import { getBookmarks } from "../api/query";
import { deleteBookmark } from "../api/mutation";

const useStyles = makeStyles((theme) => ({
  bookmark: {
    cursor: "pointer",
  },
}));

const Bookmarks = ({ state, episode }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    getBookmarks(episode.id, state[0].cookies.token).then((bookmarks) => {
      setBookmarks(bookmarks);
    });
  });

  const handleChange = () => {
    setExpanded(!expanded);
  };

  if (bookmarks === undefined || bookmarks === null || bookmarks.length === 0) {
    return <></>;
  }

  const seekToTimestamp = (state, bookmark, episode) => () => {
    playNow(state, episode, bookmark.trackTimestamp);
  };

  const deleteBoomarkId = (bookmarkId) => () => {
    deleteBookmark(bookmarkId, state[0].cookies.token);
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== bookmarkId));
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Bookmarks ({bookmarks.length})</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List dense style={{ width: "100%" }}>
          <Divider />
          {bookmarks
            .sort((a, b) => a.trackTimestamp - b.trackTimestamp)
            .map((bookmark) => (
              <ListItem
                key={uid(bookmark)}
                className={classes.bookmark}
                onClick={seekToTimestamp(state, bookmark, episode)}
                divider
              >
                <Tooltip
                  title={`Jump to ${toHHMMSS(bookmark.trackTimestamp)}`}
                  aria-label={`Jump to ${toHHMMSS(bookmark.trackTimestamp)}`}
                >
                  <ListItemText
                    primary={`${toHHMMSS(bookmark.trackTimestamp)} - ${
                      bookmark.title
                    }`}
                    secondary={`${bookmark.description}`}
                  />
                </Tooltip>
                <ListItemSecondaryAction onClick={deleteBoomarkId(bookmark.id)}>
                  <Tooltip title="Delete bookmark" aria-label="Delete bookmark">
                    <IconButton aria-label="delete bookmark">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default Bookmarks;
