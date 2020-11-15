import graphql from "./graphql";

/**
 * Create a new podcast for the user
 *
 * @param {Object} podcastMetadata metadata to be stored. Expecting the items {name, description, cover, category, subCategory, keywords}
 * @param {*} token the JWT token of the user
 */
const newPodcast = async (podcastMetadata, token) => {
  const data = await graphql(
    `
      mutation(
        $name: String!
        $description: String
        ${podcastMetadata.cover ? "$cover: Upload" : ""}
        $category: String
        $subCategory: String
        $keywords: [String]
      ) {
        createPodcastMetadata(
          input: {
            name: $name
            description: $description
            ${podcastMetadata.cover ? "cover: $cover" : ""}
            category: $category
            subCategory: $subCategory
            keywords: $keywords
          }
        ) {
          success
          podcastMetadata {
            id
            name
            description
            coverUrl
          }
        }
      }
    `,
    podcastMetadata,
    token,
    podcastMetadata.cover ? true : false
  );

  return data.createPodcastMetadata;
};

const updatePodcast = async (podcastMetadata, token) => {
  const data = await graphql(
    `mutation updatePodcastMetadata(
      $id: ID!
      ${podcastMetadata.name ? "$name: String" : ""}
      ${podcastMetadata.description ? "$description: String" : ""}
      ${podcastMetadata.cover ? "$cover: Upload" : ""}
      $category: String
      $subcategory: String
      $keywords: [String]
    ) {
      updatePodcastMetadata(
        input: {
          podcastMetadataId: $id
          ${podcastMetadata.name ? "name: $name" : ""}
          ${podcastMetadata.description ? "description: $description" : ""}
          ${podcastMetadata.cover ? "cover: $cover" : ""}
          category: $category
          subCategory: $subcategory
          keywords: $keywords
        }
      ) {
        success
      }
    }
    `,
    podcastMetadata,
    token,
    podcastMetadata.cover ? true : false
  );

  return data.updatePodcastMetadata;
};

const deletePodcast = async (podcastId, token) => {
  const data = await graphql(
    `
      mutation delete($id: ID!) {
        deletePodcastMetadata(input: { podcastMetadataId: $id }) {
          success
        }
      }
    `,
    {
      id: podcastId,
    },
    token
  );

  return data.deletePodcastMetadata;
};

/**
 * Creates a new episode for a podcast
 *
 * @param {Object} podcastEpisode the information of the episode. Should contain {id, name, description, audio, keywords}
 * @param {*} token the JWT token of the user
 */
const newEpisode = async (podcastEpisode, token) => {
  const data = await graphql(
    `
      mutation createEpisode(
        $id: ID!
        $name: String
        $description: String
        $audio: Upload
        $keywords: [String]
      ) {
        createPodcastEpisode(
          input: {
            podcastMetadataId: $id
            name: $name
            description: $description
            audio: $audio
            keywords: $keywords
          }
        ) {
          podcastMetadata {
            id
          }
        }
      }
    `,
    podcastEpisode,
    token,
    true
  );

  // If createPodcastEpisode didn't return null, the mutation was successful
  return data.createPodcastEpisode !== null;
};

const updateEpisode = async (episode, token) => {
  const data = await graphql(
    `mutation updatePodcastEpisode(
      $id: ID!
      ${episode.name ? "$name: String" : ""}
      ${episode.description ? "$description: String" : ""}
      ${episode.audio ? "$audio: Upload" : ""}
      $keywords: [String]
    ) {
      updatePodcastEpisode(
        input: {
          podcastEpisodeMetadataId: $id
          ${episode.name ? "name: $name" : ""}
          ${episode.description ? "description: $description" : ""}
          ${episode.audio ? "audio: $audio" : ""}
          keywords: $keywords
        }
      ) {
        success
      }
    }
    `,
    episode,
    token,
    episode.audio ? true : false
  );

  return data.updatePodcastEpisode;
};

const deleteEpisode = async (podcastId, token) => {
  const data = await graphql(
    `
      mutation delete($id: ID!) {
        deletePodcastEpisode(input: { podcastEpisodeMetadataId: $id }) {
          success
        }
      }
    `,
    {
      id: podcastId,
    },
    token
  );

  return data.deletePodcastEpisode;
};

const follow = async (userId, token) => {
  const data = await graphql(
    `
      mutation($userId: ID!) {
        followUser(input: { followUserId: $userId }) {
          success
          message
        }
      }
    `,
    { userId: userId },
    token
  );
  return data.followUser.success;
};

const unfollow = async (userId, token) => {
  const data = await graphql(
    `
      mutation($userId: ID!) {
        unfollowUser(input: { unfollowUserId: $userId }) {
          success
        }
      }
    `,
    { userId: userId },
    token
  );
  return data.unfollowUser.success;
};

const saveBookmark = async (episodeId, title, description, time, token) => {
  const data = await graphql(
    `
      mutation(
        $episodeId: ID!
        $title: String!
        $description: String!
        $time: Int!
      ) {
        createBookmark(
          input: {
            episode: $episodeId
            title: $title
            description: $description
            trackTimestamp: $time
          }
        ) {
          success
        }
      }
    `,
    {
      episodeId: episodeId,
      title: title,
      description: description,
      time: time,
    },
    token
  );

  return data.createBookmark.success;
};

const deleteBookmark = async (bookmarkId, token) => {
  const data = await graphql(
    `
      mutation($bookmarkId: ID!) {
        deleteBookmark(input: { bookmarkId: $bookmarkId }) {
          success
          clientMutationId
        }
      }
    `,
    {
      bookmarkId: bookmarkId,
    },
    token
  );
  return data.deleteBookmark.success;
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
const register = async (name, email, password) => {
  const data = await graphql(
    `
      mutation($name: String, $email: String!, $password: String!) {
        createUser(input: { name: $name, email: $email, password: $password }) {
          success
          token
          failWhy
        }
      }
    `,
    {
      name: name,
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

const markAsSearched = async (podcastId, token) => {
  const data = await graphql(
    `
      mutation markAsSearched($podcastId: ID!) {
        markPodcastSearched(input: { podcastMetadataId: $podcastId }) {
          success
        }
      }
    `,
    {
      podcastId: podcastId,
    },
    token
  );

  return data.markPodcastSearched;
};

const saveStream = async (query, token) => {
  const data = await graphql(
    `
      mutation saveStream($query: String!) {
        createStream(input: { search: $query }) {
          success
          stream {
            id
            search
          }
        }
      }
    `,
    {
      query: query,
    },
    token
  );

  return data.createStream;
};

const deleteStream = async (id, token) => {
  const data = await graphql(
    `
      mutation deleteStream($id: ID!) {
        deleteStream(input: { streamId: $id }) {
          success
        }
      }
    `,
    {
      id: id,
    },
    token
  );

  return data.deleteStream;
};

export {
  login,
  register,
  markAsPlayed,
  markAsSearched,
  subscribe,
  unsubscribe,
  deleteBookmark,
  saveBookmark,
  saveStream,
  deleteStream,
  follow,
  unfollow,
  newPodcast,
  updatePodcast,
  deletePodcast,
  newEpisode,
  updateEpisode,
  deleteEpisode,
};
