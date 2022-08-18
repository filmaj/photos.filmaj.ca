const TILE = 'tile';
const THUMB = 'thumb';
const COVER = 'cover';
const SQUARE = 'square';
const IGNORED = [TILE, THUMB, COVER, SQUARE];

module.exports = {
  TILE,
  THUMB,
  COVER,
  SQUARE,
  IGNORED,
  MAX_THUMB_SIZE: 300, // 300 pixels max long side for thumbnails
  MAX_TILE_SIZE: 600, // 300 pixels max long side for thumbnails
  SQUARE_SIZE: 400, // 400 pixels for square preview on whatsapp
  ignoreKey: (key) => IGNORED.some(i => key.indexOf(i) > -1),
  cover: async (Bucket, prefix, size, s3) => {
    let cover = `cover-${size}.png`;
    try {
      await s3.headObject({
        Bucket,
        Key: `${prefix}${cover}`
      }).promise();
    } catch (e) {
      cover = `DSC_0001-${size}.png`;
    }
    return cover;
  }
};
