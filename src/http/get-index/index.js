const arc = require('@architect/functions');
const layout = require('@architect/shared/layout');
const aws = require('aws-sdk');
const Bucket = process.env.PHOTO_BUCKET;
const imgBase = 'https://photos-img.filmaj.ca';
const Delimiter = '/';
const listOptions = { Bucket, Delimiter };
const s3 = new aws.S3();

async function getIndex (req) {
  let title = 'Fil Maj\'s Photo Albums';
  let head = [
    `<meta property="og:title" content="${title}" />`,
    `<meta name="twitter:title" content="${title}">`,
    '<meta name="author" content="Filip Maj">',
  ];
  let keys = await s3.listObjectsV2(listOptions).promise();
  let albums = 'No Albums :(';
  if (keys.Contents.length === 0 && keys.CommonPrefixes.length) {
    // lets list albums
    albums = keys.CommonPrefixes.reverse().map(p => {
      const idx = p.Prefix.lastIndexOf('-');
      const label = p.Prefix.substring(0, idx) + ': ' + p.Prefix.substring(idx + 1, p.Prefix.length - 1);
      return `<li>
        <a href="/${p.Prefix}">
          <img src="${imgBase}/${p.Prefix}DSC_0001.jpeg" />
          <p>${label}</p>
        </a>
      </li>`;
    }).join('\n');
    albums = `${layout.avatar()}<h1>${title}</h1><ul id="gallery">${albums}</ul>`;
  }
  return layout({ title, body: albums, req, head });
}

exports.handler = arc.http.async(getIndex);
