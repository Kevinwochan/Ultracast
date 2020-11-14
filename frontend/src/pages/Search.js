import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
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
import { saveStream, deleteStream, markAsSearched } from "../api/mutation";
import { getStreams } from "../api/query";
import config from "../api/config";

const useStyles = makeStyles((theme) => ({
  grid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

// ! Global variables === bad :(
// But its the best I can do since we can't pass props into the autocomplete component
let currQuery = null;
let savedStream = false;
let streams = [];

export default function Search() {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const classes = useStyles();
  const [query, setQuery] = useState(null);
  const [streamSaved, setStreamSaved] = useState(false);

  // Grab the user's saved streams on first render
  useEffect(() => {
    getStreams(cookies.token).then((data) => {
      if (data) {
        data.edges.forEach((n) => {
          const search = {
            id: n.node.id,
            query: n.node.search,
          };
          streams.push(search);
        });
      } else {
        console.error("Could not get saved streams");
      }
    });
  }, []);

  // Update the currQuery every time query it changes
  useEffect(() => {
    currQuery = query;

    for (const stream of streams) {
      if (currQuery === stream.query) {
        setStreamSaved(true);
        return;
      }
    }

    setStreamSaved(false);
  }, [query]);

  // Update savedStream every time it changes
  useEffect(() => {
    savedStream = streamSaved;
  }, [streamSaved]);

  return (
    <Container className={classes.grid} maxWidth="md">
      <Typography gutterBottom variant="h5">
        Search
      </Typography>
      <InstantSearch
        searchClient={config.ALGOLIA_CLIENT}
        indexName="podcasts"
        onSearchStateChange={(searchState) => {
          if (searchState.query !== "") {
            setQuery(searchState.query);
          } else {
            setQuery(null);
          }
        }}
      >
        <CustomAutocomplete />
      </InstantSearch>
    </Container>
  );
}

const Autocomplete = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [disableStream, setDisableStream] = useState(false);
  const [streamSaved, setStreamSaved] = useState(savedStream);

  if (savedStream !== streamSaved) {
    setStreamSaved(savedStream);
  }

  return (
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
        <Button
          variant="contained"
          color="primary"
          disabled={disableStream}
          onClick={(e) => {
            if (currQuery === "" || currQuery === null) {
              return;
            }

            setDisableStream(true);

            // Delete the stream
            if (streamSaved) {
              for (const stream of streams) {
                if (stream.query === currQuery) {
                  deleteStream(stream.id, cookies.token).then((data) => {
                    setDisableStream(false);
                    if (data && data.success) {
                      streams = streams.filter((e) => e !== stream);
                      savedStream = false;
                      setStreamSaved(false);
                    } else {
                      console.error("Could not delete stream");
                    }
                  });
                  return;
                }
              }
              return;
            }

            // Remove the button text and save the stream
            saveStream(currQuery, cookies.token).then((data) => {
              setDisableStream(false);
              if (data && data.success) {
                streams.push({
                  id: data.stream.id,
                  query: data.stream.search,
                });
                savedStream = true;
                setStreamSaved(true);
              } else {
                console.error("Could not save stream");
              }
            });
          }}
        >
          {streamSaved ? "Stream saved" : " Save search as stream"}
        </Button>
      </Box>
      <Results>
        <Hits hitComponent={Hit} />
      </Results>
    </>
  );
};

const Hit = ({ hit }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
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
    markAsSearched(podcast.podcast.id, cookies.token).then((data) => {
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
