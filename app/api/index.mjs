import awsLite from '@aws-lite/client'
const { PHOTO_BUCKET } = process.env
const listOptions = { Bucket: PHOTO_BUCKET, Delimiter: '/' }
let albums
export async function get(req) {
  const aws = await awsLite({
    plugins: [import('@aws-lite/s3')]
  })
  if (!albums) {
    albums = await aws.S3.ListObjectsV2(listOptions)
    if (albums.Contents.length || !albums.CommonPrefixes.length) {
      albums = []
    } else {
      albums = albums.CommonPrefixes.reverse().map(p => {
        const img = p.Prefix
        const idx = img.lastIndexOf('-');
        return `${img.substring(0, idx)}: ${img.substring(idx + 1, img.length - 1)}`;
      });
    }
  }
  return {
    json: {
      albums
    }
  }
}
