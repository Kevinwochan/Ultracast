import algoliasearch from "algoliasearch/lite";
export default {
  BACKEND_ENDPOINT:
    process.env.REACT_APP_ENDPOINT_TYPE === "local"
      ? "http://localhost:5000/graphql"
      : "http://139.59.227.230:5000/graphql",
  ALGOLIA_CLIENT: algoliasearch(
    "DLUH4B7HCZ",
    "85303ce5c9827fc85ed49f641c6963a6"
  ),
};
