import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import React, { useState } from "react";
import { follow, unfollow } from "../api/query";

const FollowButton = ({ user, sessionState }) => {
  const [following, setFollowing] = useState(user.following);
  const toggle = () => {
    if (following) {
      console.log(`unfollowing ${user.id}`);
      unfollow(user.id, sessionState.cookies.token);
    } else {
      follow(user.id, sessionState.cookies.token);
      console.log(`following to ${user.id}`);
    }
    setFollowing(!following);
  };

  return following ? (
    <Button
      variant="contained"
      color="secondary"
      onClick={toggle}
    >
      Unfollow
    </Button>
  ) : (
    <Button
      variant="contained"
      color="primary"
      onClick={toggle}
    >
      Follow
    </Button>
  );
};

export default FollowButton;
