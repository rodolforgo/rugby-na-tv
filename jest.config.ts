import type { Config } from "jest";
import nextJest from "next/jest.js";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const env = dotenv.config({ path: `.env.development` });
dotenvExpand.expand(env);

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testTimeout: 60000,
};


export default createJestConfig(config);
