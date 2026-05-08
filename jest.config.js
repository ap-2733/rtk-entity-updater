export default {
  testEnvironment: "node",

  transform: {
    "^.+\\.[cm]?[tj]sx?$": "babel-jest",
  },

  transformIgnorePatterns: ["/node_modules/(?!(msw|@mswjs|@open-draft|until-async|rettime|headers-polyfill|tough-cookie)/)"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  setupFilesAfterEnv: ["<rootDir>/test/setupTests.ts"],
};