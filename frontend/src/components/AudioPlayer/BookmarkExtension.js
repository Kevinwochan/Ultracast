import React, { useRef, useState } from "react";
import { useCookies } from "react-cookie";
import Button from "@material-ui/core/Button";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Save";
import IconButton from "@material-ui/core/IconButton";
import { saveBookmark } from "../../api/mutation";
import { toHHMMSS } from "../../common/utils";

const useStyles = makeStyles((theme) => ({
  extendedItem: {
    margin: theme.spacing(1),
    cursor: "pointer",
  },
  bookmarkMenu: {
    minHeight: 200,
    minWidth: 400,
    top: "50vh",
    left: "50%",
    transform: "translate(-50%, -50%)",
    position: "absolute",
    backgroundColor: theme.palette.background.default,
  },
  bookmarkMessage: {},
  bookmarkInputField: {
    height: "100%",
    width: "100%",
    paddingBottom: theme.spacing(1),
  },
  bookmarkCancel: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  bookmarkSave: {
    float: "right",
  },
}));

const BookmarkExtension = ({ audioEl, nowPlaying }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [open, setOpen] = useState(false);
  const bookmarkTitle = useRef(null);
  const bookmarkDescription = useRef(null);
  const bookmarkTime = useRef(null);

  const openBookmarkMenu = (event) => {
    if (
      audioEl.current === null ||
      audioEl.current.currentSrc === ""
    ) {
      return;
    }
    bookmarkTime.current = audioEl.current.currentTime;
    setOpen(true);
  };

  const closeBookmarkMenu = () => {
    setOpen(false);
  };

  const saveBookmarkHandler = () => {
    saveBookmark(
      nowPlaying.id,
      bookmarkTitle.current.value,
      bookmarkDescription.current.value,
      bookmarkTime.current,
      cookies.token
    );
    closeBookmarkMenu();
  };

  const classes = useStyles();
  return (
    <>
      <BookmarkIcon
        className={classes.extendedItem}
        onClick={openBookmarkMenu}
        color={
          nowPlaying 
            ? "primary"
            : "disabled"
        }
      />
      <Modal open={open} onClose={closeBookmarkMenu}>
        <Box className={classes.bookmarkMenu} p={5}>
          <IconButton
            color="primary"
            aria-label="cancel bookmark"
            onClick={closeBookmarkMenu}
            className={classes.bookmarkCancel}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.bookmarkMessage}
          >
            {`Bookmarked at ${toHHMMSS(bookmarkTime.current)}`}
          </Typography>
          <form noValidate autoComplete="off" onSubmit={saveBookmarkHandler}>
            <TextField
              label="Title"
              variant="outlined"
              className={classes.bookmarkInputField}
              inputRef={bookmarkTitle}
            />
            <TextField
              multiline
              label="Note"
              variant="outlined"
              className={classes.bookmarkInputField}
              inputRef={bookmarkDescription}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.bookmarkSave}
              aria-label="save"
              endIcon={<SaveIcon />}
              type="submit"
            >
              Save
            </Button>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default BookmarkExtension;
