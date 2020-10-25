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
        $category: String
        $subCategory: String
        $keywords: [String]
      ) {
        createPodcastMetadata(
          input: {
            name: $name
            description: $description
            cover: $cover
            category: $category
            subCategory: $subCategory
            keywords: $keywords
          }
        ) {
          success
          podcastMetadata {
            id
          }
        }
      }
    `,
    podcastMetadata,
    token,
    true
  );

  return data;
};

const newEpisode = async (podcastMetadata, token) => {
  return "";
};

export { newPodcast, newEpisode };
