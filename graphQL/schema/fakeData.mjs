import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname manually for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safely construct absolute paths
const usersPath = path.join(__dirname, "users.json");
const moviesPath = path.join(__dirname, "movies.json");

const fakeData = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
const fakeMovies = JSON.parse(fs.readFileSync(moviesPath, "utf-8"));

export { fakeData, fakeMovies };
export const fakeDataPath = usersPath;
export const fakeMoviesPath = moviesPath;
