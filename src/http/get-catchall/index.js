const arc = require('@architect/functions');
const layout = require('@architect/shared/layout');
const aws = require('aws-sdk');
const { extname } = require('path');
const Bucket = process.env.PHOTO_BUCKET;
const Delimiter = '/';
const imgBase = 'https://photos-img.filmaj.ca';
const s3 = new aws.S3();

async function getAlbumOrPhoto (req) {
  let ext = extname(req.path);
  let title = '';
  let images = '';
  let listOptions;
  let keys;
  let scripts = [];
  if (ext.length) {
    // detail image view
    title = req.path.substring(1);
    let album = title.split('/')[0];
    let albumLink = `/${album}`;
    images = `<a href="${albumLink}"><h2>⬅️ ${album}</h2></a>`;
    images += `<div class="img-detail"><img src="${imgBase}${req.path}" /></div>`;
    images += '<div class="img-data"><p class="comment"></p><div class="shot-details"><span class="date"></span><span class="camera"></span><span class="iso"></span><span class="focal"></span><span class="fstop"></span><span class="exposure"></span></div></div>';
    scripts = ['img-detail.js', 'tz.js'];
  } else {
    // album view
    let album = req.path.substring(1);
    if (album[album.length - 1] !== '/') album = `${album}/`; // needs trailing slashes
    listOptions = { Bucket, Delimiter, Prefix: album, StartAfter: album };
    let idx = album.lastIndexOf('-');
    let date = album.substring(0, idx);
    let albumTitle = album.substring(idx, album.length - 1).replace(/-/g, ' ');
    title = `${albumTitle}, ${date}`;
    keys = await s3.listObjectsV2(listOptions).promise();
    if (keys.Contents.length) {
      // list pictures inside albums
      images = keys.Contents.map(k => {
        return `<a href="/${k.Key}"><img src="${imgBase}/${k.Key}" /></a>`;
      }).join('\n');
      images = `<div id="gallery">${images}</div>`;
    } else {
      // no pics :(
      images = '<div id="gallery">No pictures in this album :(</div>';
    }
    images = `<h1 id="main-heading">${title}</h1><h2><a href="/">⬅️ Home</a></h2>${images}`;
  }
  return layout({ title, body: images, scripts, req });
}

exports.handler = arc.http.async(getAlbumOrPhoto);
