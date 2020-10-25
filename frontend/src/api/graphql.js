import configuration from "../api/configuration";
import axios from "axios";
import { extractFiles } from "extract-files";

/*
This file contains a definition for commonly used the commonly used HTTP headers
and parametrises the graphql interface
*/

const graphql = async (query, variables, token = "", upload = false) => {
  // ! Moved this to async cause I was having problems with returning the correct state of the promise

  // If we're uploading a file, use the uploadOptions function
  // Otherwise, just make a normal query to the backend
  let response;
  if (upload) {
    response = await fetch(
      configuration.BACKEND_ENDPOINT,
      uploadOptions(
        {
          query: query,
          variables: variables,
        },
        token
      )
    );
  } else {
    response = await axios.post(
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
    );
  }

  if (response.data && response.data.errors) {
    // An error has occurred
    console.log(response.data.errors);
    return response.data.errors;
  } else if (response.data) {
    // Successfully queried data
    console.log(response);
    /* may want to change this to only .data allowing the components to handle errors */
    return response.data.data;
  } else {
    // Probably an upload response
    return response;
  }
};

/**
 * Fetch options for mutations that include uploads. Taken from:
 * https://github.com/jaydenseric/graphql-react/blob/1b1234de5de46b7a0029903a1446dcc061f37d09/src/universal/graphqlFetchOptions.mjs
 *
 * @param {Object} operation should contain {query, variables}
 * @param {String} token the JWT token of the logged in user
 */
function uploadOptions(operation, token) {
  const fetchOptions = {
    url: configuration.BACKEND_ENDPOINT,
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const { clone, files } = extractFiles(operation);
  const operationJSON = JSON.stringify(clone);

  if (files.size) {
    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    const form = new FormData();

    form.append("operations", operationJSON);

    const map = {};
    let i = 0;
    files.forEach((paths) => {
      map[++i] = paths;
    });
    form.append("map", JSON.stringify(map));

    i = 0;
    files.forEach((paths, file) => {
      form.append(`${++i}`, file, file.name);
    });

    fetchOptions.body = form;
  } else {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = operationJSON;
  }

  return fetchOptions;
}

export default graphql;
