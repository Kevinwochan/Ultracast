import configuration from "../api/configuration";

const graphql = (query, variables, token) => {
  const fetchOptions = {
    url: configuration.BACKEND_ENDPOINT,
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: query, variables: variables }),
  };

  fetch(configuration.BACKEND_ENDPOINT, fetchOptions)
    .then((r) => r.json())
    .then((data) => {
      if (data.errors) {
        throw data.errors;
      } else {
        console.log(data);
        return data.data;
      }
    });
};

export default graphql;
