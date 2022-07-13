module.exports = {
  TILE: 'tile',
  THUMB: 'thumb',
  MAX_THUMB_SIZE: 300, // 300 pixels max long side for thumbnails
  MAX_TILE_SIZE: 600, // 300 pixels max long side for thumbnails
  ignoreKey: (key) => key.indexOf(module.exports.TILE) > -1 || key.indexOf(module.exports.THUMB) > -1
};
