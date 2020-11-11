import graphql from "./graphql";

/*
This file defines the mutation strings used and how the response data is then unpacked
*/

/* TODO: handle when the server invalidates the token */

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

const getUser = async (token) => {
  const data = await graphql(
    `
      query {
        currentUser {
          id
          name
          email
        }
      }
    `,
    {},
    token
  );

  return data.currentUser;
};

/*
Retrieves an array of podcast episodes recommended for the user
TODO: add authors if possible
*/
const getMyRecommended = async (token) => {
  const data = await graphql(
    `
      query recommended {
        recommendations {
          edges {
            node {
              name
              id
              coverUrl
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
      image: podcast.coverUrl ? podcast.coverUrl : "/branding/square.svg",
      id: podcast.id,
      title: podcast.name,
      author: {
        name: "",
        id: "",
      },
    };
  });
};

const getMyFollowing = async (token) => {
  const data = await graphql(
    `
    query {
      currentUser {
        following {
          edges {
            node {
              id
              name
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
        }
      }
    }
    `,
    {},
    token
  );
  return data.currentUser.following.edges.map((user) => ({
    id: user.node.id,
    name: user.node.name,
    episode:
      user.node.listenHistory.edges.length > 0
        ? parseEpisode(
            user.node.listenHistory.edges[
              user.node.listenHistory.edges.length - 1
            ].node.episode,
            true
          )
        : null,
  }));
};

const getHistory = async (userId, token) => {
  const data = await graphql(
    `
    query ($userId: ID!){
      allUser(id: $userId){
        edges {
          node {
            name
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
      }
    }
    `,
    { userId: userId },
    token
  );
  return {
    user: {
      name: data.allUser.edges[0].node.name,
    },
    history: data.allUser.edges[0].node.listenHistory.edges.map((episode) =>
      parseEpisode(episode.node.episode, true)
    ),
  };
};

/**
 * Gets the listening history of the user
 *
 * @param {boolean} verbose get the verbose episode output
 * @param {string} token JWT token of the user
 */
const getMyHistory = async (token, verbose = true) => {
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
      query {
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
      image: podcast.coverUrl ? podcast.coverUrl : "/branding/square.svg",
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
    id: episode.id,
    title: episode.name,
    url: episode.audioUrl,
    podcast: {
      title: episode.podcastMetadata.name,
      id: episode.podcastMetadata.id,
      image: episode.podcastMetadata.coverUrl
        ? episode.podcastMetadata.coverUrl
        : "/branding/square.svg",
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
    image: data.allPodcastMetadata.edges[0].node.coverUrl
      ? data.allPodcastMetadata.edges[0].node.coverUrl
      : "/branding/square.svg",
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
      image: podcast.node.coverUrl
        ? podcast.node.coverUrl
        : "/branding/square.svg",
      title: podcast.node.name,
      description: podcast.node.description,
      author: podcast.node.author,
      episodeCount: podcast.node.episodes.totalCount,
    })),
  };
};

/*
Fetches subscription notifications for the user
returns an array of episodes
*/
const getMyNotifications = async (token) => {
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

const getMySubscriptions = async (token) => {
  const data = await graphql(
    `
      query {
        currentUser {
          subscribedPodcasts {
            edges {
              node {
                id
                name
                coverUrl
                episodes(last: 1) {
                  edges {
                    node {
                      id
                      name
                    }
                  }
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
    image: podcast.node.coverUrl
      ? podcast.node.coverUrl
      : "/branding/square.svg",
    episodeCount: podcast.node.episodes.totalCount,
    author: podcast.node.author,
    episodes: podcast.node.episodes.edges.map((episode) => ({
      id: episode.node.id,
      title: episode.node.name,
    })),
  }));
};

/*
looks for a user registered with the email address
*/
const searchUser = async (email) => {
  const data = await graphql(
    `
      query($email: String!) {
        allUser(email: $email, first: 1) {
          totalCount
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    { email: email }
  );
  return data.allUser.totalCount === 1 ? data.allUser.edges[0].node.id : null;
};

const getBookmarks = async (episodeId, token) => {
  const data = await graphql(
    `
      query($episodeId: ID) {
        currentUser {
          bookmarks(episode: $episodeId) {
            edges {
              node {
                id
                title
                description
                trackTimestamp
              }
            }
          }
        }
      }
    `,
    { episodeId: episodeId },
    token
  );

  return data.currentUser.bookmarks.edges.map((bookmark) => bookmark.node);
};

const getStreams = async (token) => {
  const data = await graphql(
    `
      query getStreams {
        allStream {
          edges {
            node {
              id
              search
            }
          }
        }
      }
    `,
    {},
    token
  );

  return data.allStream;
};

const getAnalytics = async (token) => {
  const data = await graphql(
    `
      query {
        currentUser {
          id
          publishedPodcasts {
            edges {
              node {
                id
                name
                coverUrl
                publishDate
                episodes {
                  edges {
                    node {
                      id
                      name
                      publishDate
                      views {
                        totalCount
                        edges {
                          node {
                            latLon
                            browser
                            timestamp
                            isSubscribed
                          }
                        }
                      }
                    }
                  }
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

  return data.currentUser;
};

export {
  getAnalytics,
  searchUser,
  getBookmarks,
  getMyFollowing,
  getMyHistory,
  getMyRecommended,
  getMySubscriptions,
  getNumNotifications,
  getMyNotifications,
  getHistory,
  getPodcasts,
  getEpisodes,
  getUser,
  getUserId,
  getUserPodcasts,
  getUserPodcastsInfo,
  getPodcastInfo,
  getStreams,
};
