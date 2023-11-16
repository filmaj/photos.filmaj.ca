const arc = require('@architect/functions');
const layout = require('@architect/shared/layout');
const imageUtils = require('@architect/shared/image-utils');
const aws = require('aws-sdk');
const dayjs = require('dayjs');
const Bucket = process.env.PHOTO_BUCKET;
const Delimiter = '/';
const s3 = new aws.S3();
const cache = {};

exports.handler = arc.http.async(async function getAlbumOrPhoto (req) {
  let title = '';
  let images = '';
  let listOptions;
  let keys;
  let scripts = [];
  let head = [];
  // album view
  let album = req.params.album;
  if (album[album.length - 1] !== '/') album = `${album}/`; // needs trailing slashes
  if (cache[album]) {
    images = cache[album];
  } else {
    listOptions = { Bucket, Delimiter, Prefix: album, StartAfter: album };
    const [albumTitle, date] = imageUtils.albumTitle(album);
    title = `${albumTitle}, ${date}`;
    const cover = await imageUtils.cover(Bucket, album, imageUtils.THUMB, s3);
    head.push(`<meta property="og:title" content="${title}" />`);
    head.push('<meta name="author" content="Filip Maj">');
    head.push(`<meta property="og:image" content="${imageUtils.URL_BASE}/${album}${cover}"/>`);
    head.push(`<meta property="og:description" content="${title} Photo Album"/>`);
    keys = await s3.listObjectsV2(listOptions).promise();
    if (keys.Contents.length) {
      // list pictures inside albums
      images = keys.Contents.map(k => {
        // Ignore anything that could be a thumbnail
        if (imageUtils.ignoreKey(k.Key)) return '';
        let tile = k.Key.replace('.jpeg', `-${imageUtils.TILE}.png`);
        return `<li><a href="/${k.Key}"><img src="${imageUtils.URL_BASE}/${tile}" /></a></li>`;
      }).join('\n');
      images = `<ul id="gallery">${images}<li></li></ul>`;
    } else {
      // no pics :(
      images = '<div id="gallery">No pictures in this album :(</div>';
    }
    images = `<h2>${albumTitle}</h2><h3>${dayjs(date).format('MMMM YYYY')}</h3>${images}`;
  }
  return layout({ title, body: images, scripts, req, head });
});
