/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  clearMocks: true,
  coverageProvider: "v8",
  moduleFileExtensions: ["js", "ts"],
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "@controllers/(.*)": "<rootDir>/src/controllers/$1",
    "@database(.s)": "<rootDir>/src/database$1",
    "@dtos/(.*)": "<rootDir>/src/dtos/$1",
    "@enums/(.*)": "<rootDir>/src/enums/$1",
    "@exceptions/(.*)": "<rootDir>/src/exceptions/$1",
    "@interfaces/(.*)": "<rootDir>/src/interfaces/$1",
    "@middlewares/(.*)": "<rootDir>/src/middlewares/$1",
    "@models/(.*)": "<rootDir>/src/models/$1",
    "@routes/(.*)": "<rootDir>/src/routes/$1",
    "@services/(.*)": "<rootDir>/src/services/$1",
    "@utils/(.*)": "<rootDir>/src/utils/$1",
    "@helpers/(.*)": "<rootDir>/src/helpers/$1",
  },
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts?"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testEnvironment: "node",
};
