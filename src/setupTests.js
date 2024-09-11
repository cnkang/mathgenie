import '@testing-library/jest-dom';  // for DOM matchers (works with Vitest)
const { createCanvas } = require('canvas');

// Mock HTMLCanvasElement context for testing
HTMLCanvasElement.prototype.getContext = function() {
  return createCanvas().getContext('2d');
};
