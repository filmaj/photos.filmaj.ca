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
    let filename = title.split('/')[1];
    let fileNumber = parseInt(filename.split('_')[1].split('.')[0], 10);
    let filePrefix = filename.split('_')[0];
    let fileExt = filename.split('.')[1];
    let before = fileNumber - 1;
    let beforeLink = `${albumLink}/${filePrefix}_${String(before).padStart(4, '0')}.${fileExt}`;
    let after = fileNumber + 1;
    let afterLink = `${albumLink}/${filePrefix}_${String(after).padStart(4, '0')}.${fileExt}`;
    images = `<div id="detail-container"><a href="${albumLink}"><h2><span class="material-icons material-symbols-sharp" style="position:relative;top:3px;float:left;">photo_library</span>${album}</h2></a>`;
    images += `<div class="img-detail"><a id="left-arrow" style="display: ${before == 0 ? 'none' : 'block'}" href="${beforeLink}"><span class="material-icons material-symbols-sharp">navigate_before</span></a><img src="${imgBase}${req.path}" onerror="imgError(this)" /><a id="right-arrow" href="${afterLink}"><span class="material-icons material-symbols-sharp">navigate_next</span></a></div>`;
    images += `
<div class="img-data">
  <div class="img-setting">
    <div class="comment"></div>
    <div class="date"></div>
  </div>
  <div class="shot-details">
    <div class="flex">
      <span class="material-icons material-symbols-sharp">photo_camera</span>
      <span class="camera"></span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">theaters</span>
      <span class="iso"></span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">filter_tilt_shift</span>
      <span class="focal"></span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">camera</span>
      <span class="fstop"></span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">shutter_speed</span>
      <span class="exposure"></span>
    </div>
  </div>
  <div id="map"></div>
</div></div>`;
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
        return `<li><a href="/${k.Key}"><img src="${imgBase}/${k.Key}" /></a></li>`;
      }).join('\n');
      images = `<ul id="gallery">${images}<li></li></ul>`;
    } else {
      // no pics :(
      images = '<div id="gallery">No pictures in this album :(</div>';
    }
    images = `<div id="gallery-container"><h1 id="main-heading"><a href="/" style="float:left;text-decoration:none;"><span class="material-icons material-symbols-sharp" style="position:relative;top:3px;">photo_album</span></a>${title}</h1>${images}</div>`;
  }
  return layout({ title, body: images, scripts, req });
}

exports.handler = arc.http.async(getAlbumOrPhoto);
