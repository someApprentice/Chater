module.exports = {
  roots: ['<rootDir>'],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    '\\.(js|jsx)?$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx,js,jsx}'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/public/'],
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
}
