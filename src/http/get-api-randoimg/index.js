const arc = require('@architect/functions');
const aws = require('aws-sdk');
const Bucket = process.env.PHOTO_BUCKET;
const listOptions = { Bucket };
const s3 = new aws.S3();

async function getApiRandoImg () {
  let keys = await s3.listObjectsV2(listOptions).promise();
  let contents = keys.Contents.filter(i => i.Key.endsWith('.jpeg'));
  let index = Math.floor(Math.random() * contents.length);
  let img = contents[index];
  return {
    statusCode: 200,
    headers: {
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'content-type': 'text/plain; charset=utf8'
    },
    body: encodeURI(`https://photos-img.filmaj.ca/${img.Key}`)
  };
}

exports.handler = arc.http.async(getApiRandoImg);
