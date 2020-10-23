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
              name
              id
              author {
                name
                id
              }
            }
          }
        }
      }
    `,
    {}
  );
  return data.allPodcastMetadata.edges.map((podcast) => ({
    title: podcast.node.name ?? "unknown title",
    author: ((podcast.node.author ?? {name:"unknown author"}).name ?? "unknown author name"), // hack for our incomplete database
    image: `https://source.unsplash.com/random?sig=${getRandomNumber()}`, // TODO
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  }));
};

export { getRecommended, login, register };
