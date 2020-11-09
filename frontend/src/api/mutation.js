import graphql from "./graphql";
import { getUserId } from "./query";

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
    mutation($userId: ID!){
      followUser(input: {followUserId: $userId}){
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
    mutation($userId: ID!){
      unfollowUser(input: {unfollowUserId: $userId}){
        success
      }
    }
    `,
    { userId: userId },
    token
  );
  return data.unfollowUser.success;
};


export {
  follow,
  unfollow,
  newPodcast,
  updatePodcast,
  deletePodcast,
  newEpisode,
  updateEpisode,
  deleteEpisode,
};
