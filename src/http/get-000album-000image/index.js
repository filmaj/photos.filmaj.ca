const arc = require('@architect/functions');
const layout = require('@architect/shared/layout');
const imageUtils = require('@architect/shared/image-utils');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(localizedFormat);
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const tz = require('tz-lookup-oss');

exports.handler = arc.http.async(async function getAlbumOrPhoto (req) {
  let tables = await arc.tables();
  let exifDB = tables.exifdata;
  const key = decodeURI(req.path.substring(1));
  let album = req.params.album;
  const [albumTitle, _albumDate] = imageUtils.albumTitle(album);
  const head = [`<meta property="og:title" content="Photo from ${albumTitle}" />`];
  let albumLink = `/${album}`;
  let filename = req.params.image;
  let fileNumber = parseInt(filename.split('_')[1].split('.')[0], 10);
  let filePrefix = filename.split('_')[0];
  let fileExt = filename.split('.')[1];
  let before = fileNumber - 1;
  let beforeLink = `${albumLink}/${filePrefix}_${String(before).padStart(4, '0')}.${fileExt}`;
  let after = fileNumber + 1;
  let afterLink = `${albumLink}/${filePrefix}_${String(after).padStart(4, '0')}.${fileExt}`;
  let thumbLink = `${imageUtils.URL_BASE}${req.path.replace('.jpeg', `-${imageUtils.THUMB}.png`)}`;
  let squareLink = `${imageUtils.URL_BASE}${req.path.replace('.jpeg', `-${imageUtils.SQUARE}.png`)}`;
  head.push(`<!-- non-whatsapp preview --><meta property="og:image" content="${thumbLink}"/>`);
  head.push(`<meta property="og:image:secure_url" content="${thumbLink}"/>`);
  head.push('<meta property="og:image:type" content="image/png"/>');
  head.push(`<!-- whatsapp preview --><meta property="og:image" content="${squareLink}"/>`);
  head.push(`<meta property="og:image:secure_url" content="${squareLink}"/>`);
  head.push('<meta property="og:image:type" content="image/png"/>');
  head.push('<meta property="og:image:width" content="400"/>');
  head.push('<meta property="og:image:height" content="400"/>');
  head.push(`<!-- twitter preview --><meta name="twitter:image" content="${squareLink}">`);
  let exifTags = await exifDB.get({ key });
  console.log(exifTags);
  head.push(`<meta property="og:description" content="${exifTags.comment}"/>`);
  head.push(`<meta name="author" content="${exifTags.artist}">`);
  const snapYear = dayjs(exifTags.date);
  // prior to 2019 i was based on the westcoast
  const UTCOffset = snapYear.year() <= 2019 ? '-0500' : '-0500';
  let date = dayjs(`${exifTags.date} ${UTCOffset}`, 'YYYY:MM:DD HH:mm:ss ZZ');
  let latitude = exifTags.raw.GPSLatitude.description;
  let longitude = exifTags.raw.GPSLongitude.description;
  if (exifTags.raw.GPSLatitudeRef.value[0] === 'S') latitude = latitude * -1;
  if (exifTags.raw.GPSLongitudeRef.value[0] === 'W') longitude = longitude * -1;
  let timezone = tz(latitude, longitude);
  let zonedDate = date.tz(timezone);
  exifTags.views = (typeof exifTags.views === 'number' ? exifTags.views + 1 : 1);
  const images = `
<script type="text/javascript">latitude = ${latitude}; longitude = ${longitude};</script>
<h4><a href="${albumLink}">Back to ${albumTitle}</a></h4>
<!--
<a id="left-arrow" class="arrow" style="display: ${before == 0 ? 'none' : 'block'}" href="${beforeLink}">
  <span class="material-icons material-symbols-sharp">navigate_before</span>
</a>
-->
<img id="picture" src="${imageUtils.URL_BASE}${req.path}" onerror="imgError(this)" />
<!--
<a id="right-arrow" class="arrow" href="${afterLink}">
  <span class="material-icons material-symbols-sharp">navigate_next</span>
</a>
-->
<div id="details">
  <div class="img-setting">
    <p class="comment">${exifTags.comment}</p>
    <div class="date">
      <time datetime="${date.format()}">${zonedDate.format('LL')}</time>
      <p>${zonedDate.fromNow()}</p>
    </div>
  </div>
  <div class="shot-details">
    <div class="flex">
      <span class="material-icons material-symbols-sharp">attribution</span>
      <span class="camera">${exifTags.artist}</span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">photo_camera</span>
      <span class="camera">${exifTags.model}</span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">theaters</span>
      <span class="iso">ISO ${exifTags.iso}</span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">filter_tilt_shift</span>
      <span class="focal">${exifTags.lens}</span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">center_focus_strong</span>
      <span class="focal">${exifTags.focalLength}</span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">camera</span>
      <span class="fstop">${exifTags.fNumber}</span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">shutter_speed</span>
      <span class="exposure">${exifTags.exposure} s</span>
    </div>
    <div class="flex">
      <span class="material-icons material-symbols-sharp">visibility</span>
      <span class="exposure">${exifTags.views}</span>
    </div>
  </div>
</div>
<!--
  <div id="map"></div>
</div>
-->
`;
  const scripts = ['img-detail.js'];
  await exifDB.put(exifTags);
  return layout({ title: key, body: images, scripts, req, head });
});
