import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import theme from "../theme";
import { getPodcastInfo } from "../api/query";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function EditPodcast({ userToken }) {
  const { podcastId } = useParams();
  const [info, setInfo] = useState({
    name: "",
    description: "",
    coverUrl: "",
    category: "",
    subCategory: "",
    keywords: [""],
    totalEpisodes: 0,
    episodes: [
      {
        id: "",
        name: "",
        description: "",
        audioUrl: "",
        keywords: "",
        duration: "",
        publishDate: "",
      },
    ],
    snackbar: {
      message: "",
      severity: "info",
      open: false,
    },
  });

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setInfo((prevState) => ({
      ...prevState,
      snackbar: {
        ...prevState.snackbar,
        open: false,
      },
    }));
  };

  useEffect(() => {
    getPodcastInfo(podcastId, userToken, true).then((response) => {
      if (!response || response.edges.length === 0) {
        // Some error occurred - most likely an invalid ID
        setInfo((prevState) => ({
          ...prevState,
          snackbar: {
            message: "Invalid podcast ID",
            severity: "error",
            open: true,
          },
        }));
      } else {
        const podcast = response.edges[0].node;
        const episodes = podcast.episodes.edges.map((n) => n.node);

        setInfo((prevState) => ({
          ...prevState,
          ...podcast,
          totalEpisodes: podcast.episodes.totalCount,
          episodes: [...episodes],
        }));
      }
    });
  }, []);

  return (
    <>
      <Snackbar
        open={info.snackbar.open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={info.snackbar.severity}>
          {info.snackbar.message}
        </Alert>
      </Snackbar>

      <PodcastPreview
        image={info.coverUrl}
        title={info.name}
        description={info.description}
      />
    </>
  );
}

const selectPodcastStyle = makeStyles({
  root: {
    display: "flex",
  },
  fieldContainer: {
    width: "50%",
  },
  mediaContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "start",
    marginBottom: theme.spacing(2),
  },
  media: {
    height: 150,
    width: 150,
    border: "medium solid black",
  },
  mediaText: {
    maxWidth: 300,
  },
  preview: {
    width: "40%",
    marginLeft: "5%",
    background: "#e0e0e0",
  },
  previewHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
});

const PodcastPreview = ({ hidden, image, title, description }) => {
  const classes = selectPodcastStyle();

  return (
    <Card hidden={hidden} variant="outlined" className={classes.preview}>
      <Box mt={7}>
        <div className={classes.previewHeader}>
          <img className={classes.media} src={image} alt="Preview podcast" />
          <CardContent className={classes.mediaText}>
            <Typography variant="h6" align="center">
              {title}
            </Typography>
          </CardContent>
        </div>
        <Box m={3}>
          <Typography variant="body1" align="left" display="block">
            {description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};
