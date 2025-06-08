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
    users(filter: UserFilter): UsersResult!
    friends(userId: ID!): [User]!
    movies(filter: MovieFilter): [Movie]!
  }

  type Mutation {
    addUser(input: UserInput!): User
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean!
    addFriend(userId: ID!, friendId: ID!): User
    removeFriend(userId: ID!, friendId: ID!): User
    toggleUserActiveStatus(id: ID!): User
  }

  type UsersSuccessResult {
    success: Boolean!
    message: String
    users: [User]!
  }

  type UsersErrorResult {
    success: Boolean!
    message: String
    errorCode: String
  }

  union UsersResult = UsersSuccessResult | UsersErrorResult

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

  input MovieFilter {
    id: ID
    title: String
    isInTheaters: Boolean
    rating: Float
    releaseYear: Int
    genre: String
    director: String
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
    Irish
  }

  enum UserSortField {
    NAME
    AGE
    EMAIL
    NATIONALITY
  }
`;
