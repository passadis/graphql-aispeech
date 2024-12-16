import { ApolloServer } from "apollo-server-express";
import express from "express";
import cors from "cors"; // Add CORS middleware
import { graphqlUploadExpress } from "graphql-upload";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";

const startServer = async () => {
  const app = express();

  // Add graphql-upload middleware
  app.use(graphqlUploadExpress());

  // Configure CORS middleware
  app.use(
    cors({
      origin: "https://<frontend>.azurewebsites.net", // Allow only the frontend origin
      credentials: true, // Allow cookies and authentication headers
    })
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
  });

  await server.start();
  server.applyMiddleware({ app, cors: false }); // Disable Apollo's CORS to rely on Express

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server ready at http://0.0.0.0:${PORT}${server.graphqlPath}`)
  );
};

startServer();
