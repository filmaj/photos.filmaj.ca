let { StringDecoder } = require('string_decoder');
let imageUtils = require('@architect/shared/image-utils');
let utf16decoder = new StringDecoder('utf16le');
let utf8decoder = new StringDecoder('utf8');
let arc = require('@architect/functions');
let aws = require('aws-sdk');
// Below loaded in from a layer; see `config.arc`
let sharp = require('/opt/node_modules/sharp');
let exifreader = require('exifreader');
let s3 = new aws.S3();

exports.handler = arc.events.subscribe(async function somethingWasUploadedToS3(event) {
  console.log(JSON.stringify(event, null, 2));
  if (!event.Records || !event.Records.length) return;
  for (let i = 0; i < event.Records.length; i++) {
    let evt = event.Records[i];
    if (evt.eventSource == 'aws:s3') {
      // S3 upload notification
      let Bucket = evt.s3.bucket.name;
      let Key = decodeURIComponent(evt.s3.object.key.replace(/\+/g, ' '));
      if (imageUtils.ignoreKey(Key)) {
        console.log(Key, 'Potential non-original image detected; ignoring.');
        continue;
      }
      console.log('Got an S3 event', evt.eventName, typeof Bucket, Bucket, typeof Key, Key);
      let res = await s3.getObject({ Bucket, Key }).promise();
      let imageData = res.Body;
      console.log('Retrieved S3 object', res.ContentLength, 'bytes', typeof imageData);
      // Write exif tags to Dynamo
      let tags = exifreader.load(imageData);
      let dbRecord = extractTags(tags);
      dbRecord.key = Key;
      let tables = await arc.tables();
      let exifDB = tables.exifdata;
      await exifDB.put(dbRecord);
      console.log('Saved tag record to Dynamo', dbRecord);
      // Resize image and write to various sizes
      let newThumbKey = Key.replace('.jpeg', `-${imageUtils.THUMB}.png`);
      let newTileKey = Key.replace('.jpeg', `-${imageUtils.THUMB}.png`);
      let newSquareKey = Key.replace('.jpeg', `-${imageUtils.SQUARE}.png`);
      // detect orientation
      let height = tags['Image Height'].value;
      let width = tags['Image Width'].value;
      let landscape = width >= height;
      console.log('Image basics: w=', width, 'h=', height, 'landscape=', landscape);
      let thumbResizeOptions = {};
      let tileResizeOptions = {};
      const squareResizeOptions = { width: imageUtils.SQUARE_SIZE, height: imageUtils.SQUARE_SIZE };
      if (landscape) {
        thumbResizeOptions.width = imageUtils.MAX_THUMB_SIZE;
        tileResizeOptions.width = imageUtils.MAX_TILE_SIZE;
      } else {
        thumbResizeOptions.height = imageUtils.MAX_THUMB_SIZE;
        tileResizeOptions.height = imageUtils.MAX_TILE_SIZE;
      }
      let thumbnail = sharp(imageData).resize(thumbResizeOptions).png();
      res = await s3.putObject({
        Bucket,
        Key: newThumbKey,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=157680000',
        Body: await thumbnail.toBuffer()
      }).promise();
      console.log('Saved', newThumbKey, `to S3 (ETag: ${res.ETag})`);
      let tile = sharp(imageData).resize(tileResizeOptions).png();
      res = await s3.putObject({
        Bucket,
        Key: newTileKey,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=157680000',
        Body: await tile.toBuffer()
      }).promise();
      console.log('Saved', newTileKey, `to S3 (ETag: ${res.ETag})`);
      let square = sharp(imageData).resize(squareResizeOptions).png();
      res = await s3.putObject({
        Bucket,
        Key: newSquareKey,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=157680000',
        Body: await square.toBuffer()
      }).promise();
      console.log('Saved', newSquareKey, `to S3 (ETag: ${res.ETag})`);
    }
  }
});
function extractTags(t) {
  let Artist = cleanTag(t.Artist);
  let DateTime = cleanTag(t.DateCreated ? t.DateCreated : (t.CreateDate ? t.createDate : (t.DateTimeOriginal ? t.DateTimeOriginal : t.DateTime)));
  let Model = cleanTag(t.Model);
  let ISOSpeedRatings = cleanTag(t.ISOSpeedRatings);
  let FocalLength = cleanTag(t.FocalLength);
  let FNumber = cleanTag(t.FNumber);
  let ExposureTime = cleanTag(t.ExposureTime);
  let Lens = cleanTag(t.Lens ? t.Lens : t.LensInfo);
  // Poor person's charset detection; assumes a space exists in the comment :P
  let UserComment;
  let commentBuffer = Buffer.from(t.UserComment.value).slice(8);
  let utf16DecodedComment = utf16decoder.end(commentBuffer);
  if (utf16DecodedComment.indexOf(' ') > -1) {
    UserComment = utf16DecodedComment;
  } else {
    UserComment = utf8decoder.end(commentBuffer);
  }
  let GPSLatitude = cleanTag(t.GPSLatitude);
  let GPSLongitude = cleanTag(t.GPSLongitude);
  let GPSLatitudeRef = cleanTag(t.GPSLatitudeRef);
  let GPSLongitudeRef = cleanTag(t.GPSLongitudeRef);
  let ImageWidth= cleanTag(t['Image Width']);
  let ImageHeight= cleanTag(t['Image Height']);
  return { Artist, DateTime, Model, ISOSpeedRatings, FocalLength, FNumber, ExposureTime, Lens, UserComment, GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef, ImageWidth, ImageHeight, views: 0 };
}
function cleanTag(t) {
  if (t && t.id) delete t.id;
  return t;
}
