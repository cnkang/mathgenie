if (typeof window !== 'undefined') {
  const { createCanvas } = require('canvas');

  HTMLCanvasElement.prototype.getContext = function(type) {
    return createCanvas().getContext(type);
  };
}