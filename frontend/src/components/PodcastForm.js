import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import theme from "../theme";
import { newPodcast, updatePodcast, newEpisode } from "../api/mutation";
import getDominantColour from "../common/dominantColor";

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

const SelectPodcast = ({ fieldState }) => {
  const classes = selectPodcastStyle();
  const [fields, setFields] = fieldState;

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFields((prevState) => ({
      ...prevState,
      podcast: {
        ...prevState.podcast,
        [id]: value,
      },
    }));
  };

  const handleCoverImage = (event) => {
    const button = event.target.parentElement;
    const image = event.target.files[0];

    // Temporarily hide the button
    button.style.display = "none";

    // Create a new podcast with temporary details
    newPodcast(
      {
        name: "temp-name",
        description: "",
        cover: image,
        category: "",
        subCategory: "",
        keywords: [""],
      },
      user.token
    ).then((data) => {
      // Show the button again
      button.style.display = "inherit";

      if (data.success) {
        setFields((prevState) => ({
          ...prevState,
          podcast: {
            ...prevState.podcast,
            cover: data.podcastMetadata.coverUrl,
          },
          tempPodcastId: data.podcastMetadata.id,
          snackbar: {
            message: "Cover image upload successful",
            severity: "success",
            open: true,
          },
        }));
      } else {
        setFields((prevState) => ({
          ...prevState,
          snackbar: {
            message: "Could not upload cover image. Please try again.",
            severity: "error",
            open: true,
          },
        }));
      }
    });
  };

  // TODO: add categories, subcategories and keywords

  return (
    <>
      <div className={classes.mediaContainer}>
        <CardMedia
          className={classes.media}
          image={fields.podcast.cover}
          title="Your cover image"
        />
        <CardContent className={classes.mediaText}>
          <Typography gutterBottom variant="subtitle1">
            Image Guidelines
          </Typography>
          <Typography variant="body2" color="textSecondary">
            - Use a 150px x 150px image. <br />- File type should be either PNG
            or JPEG
          </Typography>
          <Button
            variant="contained"
            component="label"
            style={{ marginTop: theme.spacing(2) }}
          >
            <Typography gutterBottom variant="button">
              Upload podcast cover
            </Typography>

            <input
              type="file"
              style={{ display: "none" }}
              onChange={handleCoverImage}
            />
          </Button>
        </CardContent>
      </div>
      <TextField
        id="title"
        fullWidth
        variant="outlined"
        label="New Podcast Title"
        value={fields.podcast.title}
        onChange={handleChange}
      />
      <TextField
        id="description"
        multiline
        fullWidth
        rows={3}
        style={{ margin: `${theme.spacing(3)}px 0px` }}
        variant="outlined"
        label="Podcast Description"
        onChange={handleChange}
      />
    </>
  );
};

const PodcastPreview = ({ hidden, image, title, description }) => {
  const classes = selectPodcastStyle();

  return (
    <Card hidden={hidden} variant="outlined" className={classes.preview}>
      <Box mt={7}>
        <div className={classes.previewHeader}>
          <img
            className={classes.media}
            src={image}
            alt="Preview podcast"
            onLoad={(e) => {
              const img = e.target;
              // TODO fix this
              // img.src = image + "?" + new Date().getTime();
              // img.setAttribute("crossOrigin", "Anonymous");
              // const colour = getDominantColour(img);

              // // It's gross i know :(
              // img.parentElement.parentElement.parentElement.style.background = `#${colour}`;
            }}
          />
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
