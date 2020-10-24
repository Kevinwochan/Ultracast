import configuration from "../api/configuration";
import axios from "axios";

/*
This file contains a defintion for commonly used the commonly used HTTP headers
and parameterises the graphql interface
*/

const graphql = (query, variables, token = "") => {
  const promise = axios
    .post(
      configuration.BACKEND_ENDPOINT,
      JSON.stringify({
        query: query,
        variables: variables,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      console.log(response);
      return response.data.data; /* may want to change this to only .data allowing the components to handle errors */
    })
    .catch((err) => {
      console.log(err);
    });

  return promise;
};

export default graphql;
