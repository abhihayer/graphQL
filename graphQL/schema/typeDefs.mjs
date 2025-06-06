import { gql } from "apollo-server";

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    age: Int
    email: String!
    nationality: Nationality
    isActive: Boolean
    friends: [User]
    favoriteMovies: [Movie]
  }

  type Movie {
    id: ID!
    title: String!
    isInTheaters: Boolean!
    rating: Float
    releaseYear: Int
    genre: String
    director: String
  }

  type Query {
    users(filter: UserFilter): [User]!
    friends(userId: ID!): [User]!
  }

  type Mutation {
    addUser(input: UserInput!): User
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean!
    addFriend(userId: ID!, friendId: ID!): User
    removeFriend(userId: ID!, friendId: ID!): User
    toggleUserActiveStatus(id: ID!): User
  }

  input UserInput {
    name: String!
    age: Int
    email: String!
    nationality: Nationality = Indian
    isActive: Boolean
  }

  input UserFilter {
    id: ID
    name: String
    age: Int
    email: String
    nationality: Nationality
    isActive: Boolean
    friends: [ID]
  }

  enum Nationality {
    American
    British
    Canadian
    Australian
    Indian
    Chinese
    German
    French
    Spanish
    Italian
    Mexican
  }

  enum UserSortField {
    NAME
    AGE
    EMAIL
    NATIONALITY
  }
`;
