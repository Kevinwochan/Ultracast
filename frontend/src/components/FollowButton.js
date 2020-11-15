import React, { useState } from "react";
import { useCookies } from "react-cookie";
import Button from "@material-ui/core/Button";
import { follow, unfollow } from "../api/mutation";

const FollowButton = ({ user, state }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [following, setFollowing] = useState(user.following);
  const toggle = () => {
    if (following) {
      console.log(`unfollowing ${user.id}`);
      unfollow(user.id, cookies.token);
    } else {
      follow(user.id, cookies.token);
      console.log(`following ${user.id}`);
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
