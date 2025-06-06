import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema/typeDefs.mjs";
import { resolvers } from "./schema/resolvers.mjs";

// Create an Apollo Server instance
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server
  .listen()
  .then(({ url }) => {
    console.log(`Server ready at ${url}`);
  })
  .catch((error) => {
    console.error(`Error starting the server: ${error}`);
  });
