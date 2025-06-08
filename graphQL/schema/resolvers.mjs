import { fakeData, fakeMovies, fakeDataPath } from "./fakeData.mjs";
import fs from "fs";

/*

  In GraphQL the resolver `parent` argument behaves like this:

  **Root‐level Query fields** (e.g. your `users` query) receive the **root value**, which by default is `undefined` 
    (or whatever you passed in as the `rootValue` when you created your server).
  **Nested fields** on a type (e.g. the `favouriteMovies` field on each `User`) receive as their `parent` the 
    **object returned by the parent resolver**—in this case, the individual `User` instance.

    1. `parent === undefined` when resolving the top-level `users` query.
    2. `parent === <that specific User object>` when resolving that user’s `favouriteMovies` field.


 
*/
export const resolvers = {
  Query: {
    users: (parent, { filter }, context, info) => {
      if (!filter)
        return {
          users: fakeData,
          success: true,
          message: "All users fetched successfully",
        };

      // Return UsersSuccessResult or UsersErrorResult
      try {
        let outputData = fakeData.filter((user) => {
          return Object.entries(filter).every(([key, value]) => {
            if (Array.isArray(value)) {
              return user[key] && value.some((v) => user[key].includes(v));
            }
            return user[key] === value;
          });
        });

        return {
          success: true,
          users: outputData,
          message: "Users fetched successfully",
        };
      } catch (error) {
        return {
          success: false,
          errorCode: "FILTER_ERROR",
          message: error.message || "Failed to filter users",
        };
      }
    },

    friends: (_, { userId }) => {
      const user = fakeData.find((u) => u.id === userId);
      if (!user || !user.friends) return [];
      return fakeData.filter((u) => user.friends.includes(u.id));
    },

    movies: (_, { filter }) => {
      if (!filter) return fakeMovies;

      let outputMovies = fakeMovies.filter((movie) => {
        return Object.entries(filter).every(([key, value]) => {
          if (Array.isArray(value)) {
            return (
              movie[key] &&
              value.some((v) =>
                movie[key].toLowerCase().includes(v.toLowerCase())
              )
            );
          }
          if (typeof value === "number") {
            if (key === "releaseYear" && value > 1800)
              return movie[key] === value;
            else return false; // Skip invalid years
          }

          if (typeof value === "string") {
            if (value !== "")
              return movie[key].toLowerCase().includes(value.toLowerCase());
            else return true; // Skip empty strings
          }

          if (typeof value === "boolean") {
            return movie[key] === value;
          }

          if (typeof value === "object" && value !== null) {
            return Object.entries(value).every(([subKey, subValue]) => {
              return movie[key][subKey] === subValue;
            });
          }

          if (value === null || value === undefined) {
            return true;
          }
        });
      });

      return outputMovies ? outputMovies : []; // Return an empty array if fakeMovies is not defined
    },
  },

  User: {
    favoriteMovies: (user) => {
      if (!user) return [];

      if (!user.favoriteMovies || user.favoriteMovies.length === 0) {
        user.favoriteMovies = []; // Ensure favoriteMovies is an empty array if not defined

        let randomMovieId = String(Math.floor(Math.random() * 10) + 1);
        while (!user.favoriteMovies.includes(randomMovieId)) {
          user.favoriteMovies.push(randomMovieId);
          randomMovieId = String(Math.floor(Math.random() * 10) + 1);
        }
      }

      // Map favorite movie IDs to movie objects
      return user.favoriteMovies.map((movieId) => {
        const movie = fakeMovies.find((m) => m.id === movieId);
        return movie || null; // Return null if movie not found
      });
    },

    friends: (user) => {
      const { friends, ...rest } = user;
      if (!friends || friends.length === 0) return [];

      return friends.map((friendId) => {
        const friend = fakeData.find((u) => u.id === friendId);
        return friend;
      });
    },
  },

  Mutation: {
    addUser: (_, { input }) => {
      const newUser = {
        id: String(fakeData.length + 1),
        ...input,
        friends: [],
        favoriteMovies: [],
      };
      fakeData.push(newUser);

      fs.writeFileSync(fakeDataPath, JSON.stringify(fakeData));
      return newUser;
    },

    updateUser: (_, { id, input }) => {
      const userIndex = fakeData.findIndex((u) => u.id === id);
      if (userIndex === -1) return null;

      const updatedUser = { ...fakeData[userIndex], ...input };
      fakeData[userIndex] = updatedUser;

      fs.writeFileSync(fakeDataPath, JSON.stringify(fakeData));
      return updatedUser;
    },

    deleteUser: (_, { id }) => {
      const userIndex = fakeData.findIndex((u) => u.id === id);
      if (userIndex === -1) return false;

      fakeData.splice(userIndex, 1);

      fs.writeFileSync(fakeDataPath, JSON.stringify(fakeData));
      return true;
    },

    addFriend: (_, { userId, friendId }) => {
      const user = fakeData.find((u) => u.id === userId);
      const friend = fakeData.find((u) => u.id === friendId);

      if (!user || !friend || user.friends.includes(friendId)) return null;

      user.friends.push(friendId);

      fs.writeFileSync(fakeDataPath, JSON.stringify(fakeData));
      return user;
    },

    removeFriend: (_, { userId, friendId }) => {
      const user = fakeData.find((u) => u.id === userId);
      if (!user || !user.friends.includes(friendId)) return null;

      user.friends = user.friends.filter((id) => id !== friendId);

      fs.writeFileSync(fakeDataPath, JSON.stringify(fakeData));
      return user;
    },

    toggleUserActiveStatus: (_, { id }) => {
      const user = fakeData.find((u) => u.id === id);
      if (!user) return null;

      user.isActive = !user.isActive;

      fs.writeFileSync(fakeDataPath, JSON.stringify(fakeData));
      return user;
    },
  },

  UsersResult: {
    __resolveType(obj) {
      return obj.success
        ? "UsersSuccessResult" // ← return the *type name* as a string
        : "UsersErrorResult";
    },
  },

  // (2) Top-level resolvers for each concrete type
  UsersSuccessResult: {
    users(obj) {
      return (obj.users || []).sort((a, b) => a.name.localeCompare(b.name));
    },
    message(obj) {
      return obj.message || "Users fetched successfully";
    },
    success(obj) {
      return obj.success !== undefined ? obj.success : true; // Ensure success is always a boolean
    },
  },

  UsersErrorResult: {
    errorCode(obj) {
      return obj.errorCode || "UNKNOWN_ERROR";
    },
    message(obj) {
      return obj.message || "An error occurred";
    },
    success(obj) {
      return obj.success !== undefined ? obj.success : false; // Ensure success is always a boolean
    },
  },
};
