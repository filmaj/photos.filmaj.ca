const arc = require('@architect/functions');
const layout = require('@architect/shared/layout');
const aws = require('aws-sdk');
const Bucket = process.env.PHOTO_BUCKET;
const Delimiter = '/';
const listOptions = { Bucket, Delimiter };
const s3 = new aws.S3();

async function getIndex (req) {
  let title = 'filmaj\'s Photo Albums';
  let keys = await s3.listObjectsV2(listOptions).promise();
  let albums = 'No Albums :(';
  if (keys.Contents.length === 0 && keys.CommonPrefixes.length) {
    // lets list albums
    albums = keys.CommonPrefixes.map(p => {
      const idx = p.Prefix.lastIndexOf('-');
      const label = p.Prefix.substring(0, idx) + ': ' + p.Prefix.substring(idx + 1, p.Prefix.length - 1);
      return `<p><a href="/${p.Prefix}">${label}</a></p>`;
    }).join('\n');
    albums = `<h1 id="main-heading">${title}</h1>${albums}`;
  }
  return layout({ title, body: albums, req });
}

exports.handler = arc.http.async(getIndex);
