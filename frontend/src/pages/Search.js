import React, { useEffect, useState } from "react";
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
import { saveStream, deleteStream, markAsSearched } from "../api/mutation";
import { getStreams } from "../api/query";

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

let token = "";
let currQuery = null;
let savedStream = false;

export default function Search({ userToken }) {
  token = userToken;
  const classes = useStyles();
  const [query, setQuery] = useState(null);
  const [streamSaved, setStreamSaved] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [streams, setStreams] = useState([]);

  // Grab the user's saved streams on first render
  useEffect(() => {
    getStreams(userToken).then((data) => {
      if (data) {
        const prevStreams = [];
        data.edges.forEach((n) => {
          const search = {
            id: n.node.id,
            query: n.node.search,
          };
          prevStreams.push(search);
        });

        setStreams(prevStreams);
        setShowStream(true);
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
        searchClient={searchClient}
        indexName="podcasts"
        onSearchStateChange={(searchState) => {
          if (searchState.query !== "") {
            setQuery(searchState.query);
            setShowStream(false);
          } else {
            setQuery(null);
            setShowStream(true);
          }
        }}
      >
        <Autocomplete
          token={userToken}
          streams={streams}
          setStreams={setStreams}
        />
        {showStream ? <StreamList streams={streams} /> : ""}
      </InstantSearch>
    </Container>
  );
}

const StreamList = ({ streams }) => {
  return (
    <>
      <Typography gutterBottom variant="h6">
        Your streams
      </Typography>
      {streams.map((value) => (
        <Box key={value.id} my={2} ml={1}>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => {
              const search = document.querySelector("input[type='search']");
              const event = new Event("input", { bubbles: true });
              search.setAttribute("value", value.query);
              search.dispatchEvent(event);
            }}
          >
            {value.query}
          </Button>
        </Box>
      ))}
    </>
  );
};

const Autocomplete = connectAutoComplete(({ token, streams, setStreams }) => {
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
                  deleteStream(stream.id, token).then((data) => {
                    setDisableStream(false);
                    if (data && data.success) {
                      const newStreams = streams.filter((e) => e !== stream);
                      savedStream = false;
                      setStreams(newStreams);
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
            saveStream(currQuery, token).then((data) => {
              setDisableStream(false);
              if (data && data.success) {
                setStreams((prevState) => [
                  ...prevState,
                  {
                    id: data.stream.id,
                    query: data.stream.search,
                  },
                ]);
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
});

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
