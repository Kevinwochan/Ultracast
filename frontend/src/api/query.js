import graphql from "./graphql";

/*
This file defines the mutation strings used and how the response data is then unpacked
*/

/* TODO: handle when the server invalidates the token */

/*
Logs a user in
*/
const login = async (email, password) => {
  const data = await graphql(
    `
      mutation($email: String!, $password: String!) {
        login(input: { email: $email, password: $password }) {
          success
          token
          message
        }
      }
    `,
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
    success: data.createUser.success,
    message: data.createUser.failWhy,
    token: data.createUser.token,
  };
};

/**
 * Gets the logged in user's ID
 *
 * @param {String} token
 */
const getUserId = async (token) => {
  const data = await graphql(
    `
      query getListenHistory {
        currentUser {
          id
        }
      }
    `,
    {},
    token
  );

  return data.currentUser.id;
};

/*
Retrieves an array of podcast episodes recommended for the user
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
    author: {
      // ! @Kev this problem should be fixed now
      // name: (podcast.node.author ?? { name: "unknown author" }).name ??
      // "unknown author name", // hack for our incomplete database
      name: podcast.node.author.name,
      id: podcast.node.author.id,
    },
    image: podcast.node.coverUrl,
    id: podcast.node.id,
    episode: {
      url: podcast.node.episodes.edges[0].node.audioUrl, // replace with podcast.episodes.edges[0].node.audioUrl when databse is fixed
      id: podcast.node.episodes.edges[0].node.id,
      name: podcast.node.episodes.edges[0].node.name,
    },
  }));
};

/**
 * Gets the listening history of the user
 *
 * @param {boolean} verbose get the verbose episode output
 * @param {string} token JWT token of the user
 */
const getHistory = async (verbose = true, token) => {
  const data = await graphql(
    `query getListenHistory {
      currentUser {
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
    }`,
    {},
    token
  );

  const userListenHistory = data.currentUser.listenHistory.edges;
  return userListenHistory.map((n) => {
    const episode = n.node.episode;
    return parseEpisode(episode, verbose);
  });
};

/**
 * Fetches the logged in user's podcasts
 *
 * @param {string} token the JWT token of the usr
 */
const getUserPodcasts = async (token) => {
  const data = await graphql(
    `
      query getUserPodcasts {
        currentUser {
          publishedPodcasts {
            edges {
              node {
                name
                id
                description
                coverUrl
              }
            }
          }
        }
      }
    `,
    {},
    token
  );

  return data.currentUser.publishedPodcasts.edges.map((n) => {
    const podcast = n.node;
    return {
      id: podcast.id,
      title: podcast.name,
      description: podcast.description,
      cover: podcast.coverUrl,
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
        id
        name
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
  getUserId,
  getUserPodcasts,
  getHistory,
};
