import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import algoliasearch from "algoliasearch/lite";
import {
  connectAutoComplete,
  connectStateResults,
  InstantSearch,
  SearchBox,
  Hits,
  PoweredBy,
} from "react-instantsearch-dom";
import { SearchResult } from "../components/Podcast";
import "instantsearch.css/themes/algolia.css";
import { markAsSearched } from "../api/mutation";

const searchClient = algoliasearch(
  "DLUH4B7HCZ",
  "85303ce5c9827fc85ed49f641c6963a6"
);

const useStyles = makeStyles((theme) => ({
  grid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

// ! Global variable == bad :(
let token = "";

export default function Search({ userToken }) {
  token = userToken;
  const classes = useStyles();

  return (
    <Container className={classes.grid} maxWidth="md">
      <Typography gutterBottom variant="h5">
        Search
      </Typography>
      <InstantSearch searchClient={searchClient} indexName="podcasts">
        <CustomAutocomplete />
      </InstantSearch>
    </Container>
  );
}

const Autocomplete = () => (
  <>
    <Box mb={2}>
      <SearchBox />
    </Box>
    <Box
      mb={2}
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <PoweredBy />
      <Button variant="contained" color="primary">
        Save search as stream
      </Button>
    </Box>
    <Results>
      <Hits hitComponent={Hit} />
    </Results>
  </>
);

const Hit = ({ hit }) => {
  const podcast = {
    podcast: {
      id: hit.objectID,
      title: hit.name,
      image: hit.cover_url,
      subscribers: hit.numSubscribers,
    },
    author: {
      id: hit.author,
      name: hit.author__name,
    },
  };

  const markAsSearchedEvent = () => {
    markAsSearched(podcast.podcast.id, token).then((data) => {
      if (!data.success) {
        console.error("Could not mark podcast as searched");
      }
    });
  };

  return (
    <div onClick={markAsSearchedEvent}>
      <SearchResult podcast={podcast} />
    </div>
  );
};

// Don't show results when there's no query
const Results = connectStateResults(({ searchState, children }) =>
  searchState && searchState.query ? children : <div></div>
);

const CustomAutocomplete = connectAutoComplete(Autocomplete);
