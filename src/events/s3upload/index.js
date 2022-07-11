let { StringDecoder } = require('string_decoder');
let utf16decoder = new StringDecoder('utf16le');
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
      console.log('Got an S3 event', evt.eventName, typeof Bucket, Bucket, typeof Key, Key);
      if (Key.indexOf('thumb') > -1) {
        console.log('Potential thumbnail image detected; ignoring.');
        return;
      }
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
      // Resize image and write to thumbnail
      let newKey = Key.replace('.jpeg', '-thumb.png');
      let thumbnail = sharp(imageData).resize(300, 200).png();
      res = await s3.putObject({
        Bucket,
        Key: newKey,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=157680000',
        Body: await thumbnail.toBuffer()
      }).promise();
      console.log('Saved', newKey, `to S3 (ETag: ${res.ETag})`);
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
  let UserComment = utf16decoder.end(Buffer.from(t.UserComment.value).slice(8));
  let GPSLatitude = cleanTag(t.GPSLatitude);
  let GPSLongitude = cleanTag(t.GPSLongitude);
  let GPSLatitudeRef = cleanTag(t.GPSLatitudeRef);
  let GPSLongitudeRef = cleanTag(t.GPSLongitudeRef);
  return { Artist, DateTime, Model, ISOSpeedRatings, FocalLength, FNumber, ExposureTime, Lens, UserComment, GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef };
}
function cleanTag(t) {
  delete t.id;
  return t;
}
