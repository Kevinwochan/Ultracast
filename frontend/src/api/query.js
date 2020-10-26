import graphql from "../api/graphql";

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
  // Maps the first  into episodes
  return data.allPodcastMetadata.edges.map((podcast) => ({
    url: podcast.node.episodes.edges[0].node.audioUrl,
    id: podcast.node.episodes.edges[0].node.id,
    title : podcast.node.episodes.edges[0].node.name,
    podcast: {
      image: podcast.node.coverUrl,
      id: podcast.node.id,
      title: podcast.node.name,
    },
    author: {
      name: podcast.node.author.name,
      id: podcast.node.author.id,
    },
  }));
};

/**
 * Gets the listening history of the user
 *
 * @param {boolean} verbose get the verbose episode output
 * @param {string} token JWT token of the user
 */
const getHistory = async (token, verbose = true) => {
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
  duration
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
    url: episode.audioUrl,
    author: episode.author,
    length: episode.duration,
    podcast: {
      title: episode.podcastMetadata.name,
      id: episode.podcastMetadata.id,
      image: episode.podcastMetadata.coverUrl,
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

/*
Fetches a array of episodes the are part of the specified podcast
*/
const getEpisodes = async (podcastId, token) => {
  const data = await graphql(
    `
      query($podcastId: ID!) {
        allPodcastMetadata(id: $podcastId) {
          edges {
            node {
              name
              description
              coverUrl
              episodes {
                edges {
                  node {
                    id
                    name
                    audioUrl
                    duration
                    description
                  }
                }
              }
              author {
                id
                name
              }
            }
          }
        }
      }
    `,
    {
      podcastId: podcastId,
    },
    token
  );
  if (data.allPodcastMetadata === null) return {};
  const podcast = {
    title: data.allPodcastMetadata.edges[0].node.name,
    description: data.allPodcastMetadata.edges[0].node.description,
    author: data.allPodcastMetadata.edges[0].node.author,
    image: data.allPodcastMetadata.edges[0].node.coverUrl,
  }
  return {
    podcast: podcast,
    episodes: data.allPodcastMetadata.edges[0].node.episodes.edges.map(
      (episode) => ({
        id: episode.node.id,
        title: episode.node.name,
        url: episode.node.audioUrl,
        length: episode.node.duration,
        description: episode.node.description,
        podcast: podcast,
      })
    ),
  };
};

/*
Fetches a array of podcasts published by an author
*/
const getPodcasts = async (authorId, token) => {
  const data = await graphql(
    `
      query($authorId: ID!) {
        allPodcastMetadata(author: $authorId) {
          edges {
            node {
              id
              name
              description
              coverUrl
              author {
                id
                name
              }
              episodes {
                totalCount
              }
            }
          }
        }
      }
    `,
    {
      authorId: authorId,
    },
    token
  );
  if (data.allPodcastMetadata === null) return [];
  const author = data.allPodcastMetadata.edges[0].node.author
  return {
    author: author,
    podcasts: data.allPodcastMetadata.edges.map(
      (podcast) => ({
        id: podcast.node.id,
        image: podcast.node.coverUrl,
        title: podcast.node.name,
        description: podcast.node.description,
        author: podcast.node.author,
        episodeCount: podcast.node.episodes.totalCount
      })
    )
  }
}

export {
  getPodcasts,
  getEpisodes,
  markAsPlayed,
  newPodcast,
  getRecommended,
  login,
  register,
  getUserPodcasts,
  getHistory,
};
