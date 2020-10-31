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
      $name: String
      $description: String
      ${podcastMetadata.cover ? "$cover: Upload" : ""}
      $category: String
      $subcategory: String
      $keywords: [String]
    ) {
      updatePodcastMetadata(
        input: {
          podcastMetadataId: $id
          name: $name
          description: $description
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

export { newPodcast, updatePodcast, newEpisode };
