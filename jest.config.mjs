/** @type {import('ts-jest').JestConfigWithTsJest} */
// import { createDefaultPreset } from 'ts-jest';
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.test.json",
      },
    ],
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  transformIgnorePatterns: ["/node_modules/(?!(@noble)/).*"],
};
