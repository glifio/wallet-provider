module.exports = {
  collectCoverageFrom: ['**/*.{js}', '!**/node_modules/**'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '@openworklabs/lotus-jsonrpc-engine':
      '<rootDir>/test/mock-lotus-jsonrpc-engine.js',
  },
}
