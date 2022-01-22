const arc = require('@architect/functions');
const aws = require('aws-sdk');
const { extname } = require('path');
// const region = process.env.AWS_REGION;
const Bucket = process.env.PHOTO_BUCKET;
const Delimiter = '/';
const imgBase = 'https://photos-img.filmaj.ca';
const s3 = new aws.S3();

async function getIndex (req) {
  let path = req.path;
  let ext = extname(path);
  let images = '';
  let title = '';
  if (ext.length) {
    // file name, so image detail view
  } else {
    let keys = [];
    let listOptions = { Bucket, Delimiter };
    if (path === '/') {
      // root, do nothing, default options are good
      title = 'filmaj\'s Photo Albums';
    } else {
      // some album name
      path = path.substring(1); // drop leading slash
      listOptions.Prefix = path;
      listOptions.StartAfter = path; // dont list the folder key itself
      let idx = path.lastIndexOf('-');
      let date = path.substring(0, idx);
      let album = path.substring(idx, path.length - 1).replace(/-/g, ' ');
      title = `${album}, ${date}`;
    }
    keys = await s3.listObjectsV2(listOptions).promise();
    if (keys.Contents.length === 0 && keys.CommonPrefixes.length) {
      // lets list albums
      images = keys.CommonPrefixes.map(p => {
        const idx = p.Prefix.lastIndexOf('-');
        const label = p.Prefix.substring(0, idx) + ': ' + p.Prefix.substring(idx + 1, p.Prefix.length - 1);
        return `<p><a href="/${p.Prefix}">${label}</a></p>`;
      }).join('\n');
    } else if (keys.Contents.length) {
      // list pictures inside albums
      images = keys.Contents.map(k => {
        return `<img src="${imgBase}/${k.Key}" /><p class="img-comment"></p><div class="shot-details"><span class="date"></span><span class="iso"></span><span class="focal"></span><span class="fstop"></span><span class="exposure"></span><span class="camera"></span></div>`;
      }).join('\n');
      images = `<div id="gallery">${images}</div>`;
    } else {
      // no pics :(
      images = '<div id="gallery">No pictures in this album :(</div>';
    }
  }
  return {
    headers: {
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'content-type': 'text/html; charset=utf8'
    },
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>filmaj's Photos</title>
  <link rel="stylesheet" href="${arc.static('index.css')}" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
</head>
<body>
<h1 id="main-heading">${title}</h1>
${images}
</body>
<script src="https://cdn.jsdelivr.net/npm/exif-js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/dayjs.min.js" integrity="sha512-bwD3VD/j6ypSSnyjuaURidZksoVx3L1RPvTkleC48SbHCZsemT3VKMD39KknPnH728LLXVMTisESIBOAb5/W0Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/customParseFormat.min.js" integrity="sha512-nbPJ/ANJ1DCwUWGyfS+PY7RMysy5UnFyOzPTjzcphOuVbUqrukQAZ9kkNvTkPmItJRuuL5IqNufQTHPyxxpmig==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/relativeTime.min.js" integrity="sha512-7YYTlJ8OTdmDMztOy8q+zfRI/+y/IWnVp1oS4kiTKa+X2P09k/ObWUemEjtMoumu8v4A0s1NZu7WjfR+UxhRCQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/localizedFormat.min.js" integrity="sha512-webaelc41/yR5a3vWQMwU1o6nqNPlwiiF9T4UfUJjGb/+jTHvpd7Xbj1d4IkHTxrjOnrl04W2D6ytruI9NNWhw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/utc.min.js" integrity="sha512-TU4ndEYOqql+pMXn14M8RDWsjjD+VPUA2RoWSuuFd+blPJW4oLrL1w1zAGdlrk4jsE2FEBH5CU3+fmogVYEqIQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/timezone.min.js" integrity="sha512-72V2JNSAxd3rsQIpDSAbCTQXD6gi91Cd/IFZ6NYwRjZSiIlIJfDrJLXq+UomWstOg+zGHWFfkTDl3APEUMoqlw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script type="text/javascript">dayjs.extend(dayjs_plugin_customParseFormat);dayjs.extend(dayjs_plugin_relativeTime);dayjs.extend(dayjs_plugin_localizedFormat);dayjs.extend(dayjs_plugin_utc);dayjs.extend(dayjs_plugin_timezone);</script>
<script type="text/javascript" src="${arc.static('tz.js')}"></script>
<script type="text/javascript" src="${arc.static('index.js')}"></script>
</html>
`
  };
}

exports.handler = arc.http.async(getIndex);
