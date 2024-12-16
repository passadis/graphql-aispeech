import React from "react";
import { createRoot } from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import App from "./App";

const client = new ApolloClient({
    link: createUploadLink({
      uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
      headers: {
        "x-apollo-operation-name": "UploadFile", // Add this header for CSRF prevention
        "apollo-require-preflight": "true", // Ensures preflight checks are passed
      },
    }),
    cache: new InMemoryCache(),
  });

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
