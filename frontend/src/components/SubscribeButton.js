import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { subscribe, unsubscribe } from "../api/mutation";

const SubscribeButton = ({ podcast }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [subscribed, setSubscription] = useState(podcast.subscribed);
  const toggleSubscription = () => {
    if (subscribed) {
      console.log(`unsubscribing to ${podcast.id}`);
      unsubscribe(podcast.id, cookies.token);
    } else {
      subscribe(podcast.id, cookies.token);
      console.log(`subscribing to ${podcast.id}`);
    }
    setSubscription(!subscribed);
  };

  return subscribed ? (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<RemoveIcon />}
      onClick={toggleSubscription}
    >
      Unsubscribe
    </Button>
  ) : (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={toggleSubscription}
    >
      Subscribe
    </Button>
  );
};

export default SubscribeButton;
