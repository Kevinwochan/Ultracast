import graphql from "../api/graphql";

const getRandomNumber = () => {
  return Math.floor(Math.random() * 1000);
};

/*
An async function that wraps a graphql query to standardise/abstract away the graphql implementation
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
An async function that wraps a graphql query to standardise/abstract away the graphql implementation
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
    image: podcast.node.coverUrl, //TODO get random cover when this resolves to a 404
    url: podcast.node.episodes.edges[0].node.audioUrl,
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

// Query for lots of information on an episode (like for the Recommended page)
const verboseEpisode = `
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

export { getRecommended, getHistory, login, register };
