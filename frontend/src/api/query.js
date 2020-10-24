import graphql from "../api/graphql";

/*
This file defines the mutation strings used and how the response data is then unpacked
*/

const getRandomNumber = () => {
  return Math.floor(Math.random() * 1000);
};

/* TODO: handle when the server invalidates the token */

/*
Logs a user in
*/
const login = async (email, password) => {
  const data = await graphql(
    "mutation($email: String!, $password: String!) {login(input: {email: $email, password: $password}) {success token message}}",
    {
      email: `${email}`,
      password: `${password}`,
    }
  );
  return data.login;
};

/*
Registers a email password combination as user account
*/
const register = async (email, password) => {
  const data = await graphql(
    "mutation($email: String!, $password: String!) {createUser(input: {email: $email, password: $password}) {success token failWhy}}",
    {
      email: `${email}`,
      password: `${password}`,
    }
  );
  return {
    sucess: data.createUser.success,
    message: data.createUser.failWhy,
    token: data.createUser.token,
  };
};

/*
Retriveves an array of podcast episodes recommended for the user
*/
const getRecommended = async () => {
  const data = await graphql(
    `
      {
        allPodcastMetadata(first: 10) {
          edges {
            node {
              ${compactPodcast}
            }
          }
        }
      }
    `,
    {}
  );

  // TODO: put the mapping into another function similar to parseEpisode
  return data.allPodcastMetadata.edges.map((podcast) => ({
    title: podcast.node.name ?? "unknown title",
    author:
      (podcast.node.author ?? { name: "unknown author" }).name ??
      "unknown author name", // hack for our incomplete database
    image: podcast.node.coverUrl,
    id: podcast.node.id,
    episode: {
      url: podcast.node.episodes.edges[0].node.audioUrl, // replace with podcast.episodes.edges[0].node.audioUrl when databse is fixed
      id: podcast.node.episodes.edges[0].node.id,
      name: podcast.node.episodes.edges[0].node.name,
    },
  }));
};

const getHistory = async (verbose = true) => {
  const data = await graphql(
    `
    query getListenHistory($user: ID!) {
      allUser(id: $user) {
          edges {
            node {
              listenHistory {
                edges {
                  node {
                    episode {
                      ${verbose ? verboseEpisode : compactEpisode}
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      // TODO remove this - currently hardcoded
      user: "VXNlcjo1ZjkyY2RmY2M2OTU3ZmM2MWI4OWUzOWQ=",
    }
  );

  const userListenHistory = data.allUser.edges[0].node.listenHistory.edges;
  return userListenHistory.map((n) => {
    const episode = n.node.episode;
    return parseEpisode(episode, verbose);
  });
};

/**
 * Fetches the logged in user's podcasts
 */
const getUserPodcasts = async () => {
  const data = await graphql(
    `
      query getUserPodcasts($user: ID) {
        allPodcastMetadata(id: $user) {
          edges {
            node {
              id
              name
              author {
                id
              }
            }
          }
        }
      }
    `,
    {
      // TODO remove this - currently hardcoded
      user: "VXNlcjo1ZjkyY2UwM2M2OTU3ZmM2MWI4OWUzZGY=",
    }
  );

  return data.allPodcastMetadata.edges.map((n) => {
    const podcast = n.node;
    return {
      value: podcast.id,
      label: podcast.name,
      author: podcast.author.id,
    };
  });
};

// Query for lots of information on an episode (like for the Recommended page)
const verboseEpisode = `
  id
  name
  description
  audioUrl
  podcastMetadata {
    name
    id
    coverUrl
    author {
      name
      id
    }
  }
`;

// Query for not a lot of info on an episode (like for the Dashboard)
const compactEpisode = `
  id
  name
  audioUrl
  podcastMetadata {
    name
    id
    coverUrl
    author {
      name
      id
    }
  }
`;

// Turns the received data into episode data used in the FE
const parseEpisode = (episode, verbose = true) => {
  const verboseInfo = {
    length: "10", //TODO
    description: episode.description,
  };

  return {
    title: episode.name,
    image: episode.podcastMetadata.coverUrl,
    url: episode.audioUrl,
    author: episode.author,
    podcast: {
      title: episode.podcastMetadata.name,
      id: episode.podcastMetadata.id,
    },
    ...(verbose ? verboseInfo : null),
  };
};

const verbosePodcast = ``;
const compactPodcast = `
  name
  id
  coverUrl
  author {
    name
    id
  }
  episodes(first: 1) {
    edges {
      node {
        audioUrl
      }
    }
  }
`;

const newPodcast = async (title, description, keywords, token) => {
  const data = await graphql(
    `
      mutation($author: ID!, $name: String!, $description: String) {
        createPodcastMetadata(
          input: { author: $author, name: $name, description: $description }
        ) {
          success
          podcastMetadata {
            id
            name
          }
        }
      }
    `,
    {
      name: title,
      author:
        "VXNlcjo1Zjg4MDJkODhjMTk0NDgwNTlkNDM4NTY=" /* TODO: dynamic authors */,
      description: description,
      keywords: keywords,
    }
  );
  return data.podcastMetadata;
};

/*
Marks the podcast id given as watched for the specified user (token)
TOOD: make the user be identified by token
*/
const markAsPlayed = async (episodeId, token) => {
  const data = await graphql(
    `
      mutation($episodeId: ID!) {
        markPodcastListened(input: { podcastEpisodeMetadataId: $episodeId }) {
          success
        }
      }
    `,
    {
      episodeId: episodeId,
    },
    token
  );
  return data.markPodcastListened;
};

export {
  markAsPlayed,
  newPodcast,
  getRecommended,
  login,
  register,
  getUserPodcasts,
  getHistory,
};