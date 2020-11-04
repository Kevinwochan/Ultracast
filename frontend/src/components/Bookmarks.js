import React from "react";
import Button from "@material-ui/core/Button";
import BookmarksIcon from "@material-ui/icons/Bookmarks";

const Bookmarks = ({ bookmarks }) => {
    if (bookmarks === null){
        return (<></>);
    }
  return (
    <Button
      variant="contained"
      color="primary"
      size="small"
      endIcon={<BookmarksIcon />}
    >
      Bookmarks
    </Button>
  );
};

export default Bookmarks;
