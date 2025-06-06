import { fakeData, fakeMovies, fakeDataPath } from "./fakeData.mjs";
import fs from "fs";

export const resolvers = {
  Query: {
    users: (_, { filter }) => {
      if (!filter) return fakeData;

      let outputData = fakeData.filter((user) => {
        return Object.entries(filter).every(([key, value]) => {
          if (Array.isArray(value)) {
            return user[key] && value.some((v) => user[key].includes(v));
          }
          return user[key] === value;
        });
      });

      return outputData;
    },

    friends: (_, { userId }) => {
      const user = fakeData.find((u) => u.id === userId);
      if (!user || !user.friends) return [];
      return fakeData.filter((u) => user.friends.includes(u.id));
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
};
