import graphql from "../api/graphql";

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
        $cover: Upload
        ${podcastMetadata.cover ? "$category: String" : ""}
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

const newEpisode = async (podcastMetadata, token) => {
  // createPodcastEpisode(input: { podcastMetadataId: $id, audio: $audio }) {
  //   podcastMetadata {
  //     id
  //   }
  // }
  return "";
};

export { newPodcast, newEpisode };
