module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'jsx'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(module-to-transform|@vercel/speed-insights)/)'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
};
