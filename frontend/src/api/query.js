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
const getRecommended = async (token) => {
  const data = await graphql(
    `
      query recommended {
        recommendations {
          edges {
            node  {
              ${compactPodcast}
            }
          }
        }
      }
    `,
    {},
    token
  );

  return data.recommendations.edges.map((n) => {
    const podcast = n.node;
    return {
      image: podcast.coverUrl,
      id: podcast.id,
      title: podcast.name,
      author: podcast.author,
    };
  });
};

/**
 * Gets the listening history of the user
 *
 * @param {boolean} verbose get the verbose episode output
 * @param {string} token JWT token of the user
 */
const getHistory = async (token, verbose = true) => {
  const data = await graphql(
    `query{
      currentUser {
      listenHistory {
        edges {
          node {
            episode {
              ${verboseEpisode}
            }
          }
        }
        }
      }
    }
    `,
    {},
    token
  );

  const userListenHistory = data.currentUser.listenHistory.edges.reverse();
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

const getUserPodcastsInfo = async (token) => {
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
      }
    `,
    {},
    token
  );

  return data.currentUser.publishedPodcasts.edges.map((n) => {
    const podcast = n.node;
    return {
      id: podcast.id,
      image: podcast.coverUrl,
      title: podcast.name,
      description: podcast.description,
      episodeCount: podcast.episodes.totalCount,
    };
  });
};

const getPodcastInfo = async (podcastId, userToken, episodes = true) => {
  const data = await graphql(
    `
  query getPodcast($id: ID!){
    allPodcastMetadata(id: $id){
      edges{
        node{
          ${episodes ? verbosePodcastAndEpisode : verbosePodcast}
        }
      }
    }
  }
  `,
    {
      id: podcastId,
    },
    userToken
  );

  return data.allPodcastMetadata;
};

// Query for lots of information on an episode (like for the Recommended page)
const verboseEpisode = `
  id
  name
  description
  audioUrl
  duration
  publishDate
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
    description: episode.description,
    length: episode.duration,
    date: new Date(episode.publishDate),
  };

  return {
    title: episode.name,
    url: episode.audioUrl,
    podcast: {
      title: episode.podcastMetadata.name,
      id: episode.podcastMetadata.id,
      image: episode.podcastMetadata.coverUrl,
      author: episode.podcastMetadata.author,
    },
    ...(verbose ? verboseInfo : null),
  };
};

const verbosePodcastAndEpisode = `
  name
  description
  coverUrl
  category
  subCategory
  keywords
  episodes {
    totalCount
    edges {
      node {
        id
        name
        description
        audioUrl
        keywords
        duration
        publishDate
      }
    }
  }
`;

const verbosePodcast = `          
  id
  name
  coverUrl
  description
  category
  subCategory
  keywords
  author {
    id
    name
  }
`;

const compactPodcast = `
  name
  id
  coverUrl
  author {
    name
    id
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
                totalCount
                edges {
                  node {
                    id
                    name
                    audioUrl
                    duration
                    description
                    publishDate
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
    image:
      data.allPodcastMetadata.edges[0].node.coverUrl ?? "/branding/square.svg",
    episodeCount: data.allPodcastMetadata.edges[0].node.episodes.totalCount,
  };
  return {
    podcast: podcast,
    episodes: data.allPodcastMetadata.edges[0].node.episodes.edges.map(
      (episode) => ({
        id: episode.node.id,
        title: episode.node.name,
        url: episode.node.audioUrl,
        length: episode.node.duration,
        description: episode.node.description,
        date: new Date(episode.node.publishDate),
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
  if (data.allPodcastMetadata.edges.length === 0)
    return { author: { name: "Author not found" }, podcasts: [] };
  const author = data.allPodcastMetadata.edges[0].node.author;
  return {
    author: author,
    podcasts: data.allPodcastMetadata.edges.map((podcast) => ({
      id: podcast.node.id,
      image: podcast.node.coverUrl,
      title: podcast.node.name,
      description: podcast.node.description,
      author: podcast.node.author,
      episodeCount: podcast.node.episodes.totalCount,
    })),
  };
};

/*
subscribes the the specified user (token) to the specified podcast series
*/
const subscribe = async (podcastId, token) => {
  const data = await graphql(
    `
      mutation($podcastId: ID!) {
        subscribePodcast(input: { podcastMetadataId: $podcastId }) {
          success
        }
      }
    `,
    {
      podcastId: podcastId,
    },
    token
  );
  return data.subscribePodcast.success;
};

/*
subscribes the the specified user (token) to the specified podcast series
*/
const unsubscribe = async (podcastId, token) => {
  const data = await graphql(
    `
      mutation($podcastId: ID!) {
        unsubscribePodcast(input: { podcastMetadataId: $podcastId }) {
          success
        }
      }
    `,
    {
      podcastId: podcastId,
    },
    token
  );
  return data.unsubscribePodcast.success;
};

/*
Fetches subscription notifications for the user
returns an array of episodes
*/
const getNotifications = async (token) => {
  const data = await graphql(
    `
    query {
      newSubscribedPodcasts{
        edges {
          node {
            ${verboseEpisode}
          }
        }
      }
    }
    `,
    {},
    token
  );
  return data.newSubscribedPodcasts.edges.map((edges) => {
    return parseEpisode(edges.node);
  });
};

/*
Fetches the number of notifications for the user
use this for deciding whether or not to fetch more data
returns a number
*/
const getNumNotifications = async (token) => {
  const data = await graphql(
    `
      query {
        newSubscribedPodcasts {
          totalCount
        }
      }
    `,
    {},
    token
  );
  return data.newSubscribedPodcasts.totalCount;
};

const getSubscriptions = async (token) => {
  const data = await graphql(
    `
      query {
        currentUser {
          subscribedPodcasts {
            edges {
              node {
                id
                name
                description
                coverUrl
                episodes {
                  totalCount
                }
                author {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
    {},
    token
  );

  return data.currentUser.subscribedPodcasts.edges.map((podcast) => ({
    id: podcast.node.id,
    title: podcast.node.name,
    image: podcast.node.coverUrl,
    description: podcast.node.description,
    episodeCount: podcast.node.episodes.totalCount,
    author: podcast.node.author,
  }));
};

export {
  getSubscriptions,
  getNumNotifications,
  getNotifications,
  subscribe,
  unsubscribe,
  getPodcasts,
  getEpisodes,
  markAsPlayed,
  newPodcast,
  getRecommended,
  login,
  register,
  getUserId,
  getUserPodcasts,
  getUserPodcastsInfo,
  getPodcastInfo,
  getHistory,
};
