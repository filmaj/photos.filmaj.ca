const arc = require('@architect/functions');

module.exports = function layout({ title, body, scripts, head, req }) {
  scripts = scripts || [];
  head = head || [];
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
  <title>${title}</title>
  <link rel="apple-touch-icon" sizes="120x120" href="${arc.static('favicons/apple-touch-icon.png')}">
  <link rel="icon" type="image/png" sizes="32x32" href="${arc.static('favicons/favicon-32x32.png')}">
  <link rel="icon" type="image/png" sizes="16x16" href="${arc.static('favicons/favicon-16x16.png')}">
  <link rel="stylesheet" href="https://use.typekit.net/cwg3htt.css">
  <link rel="stylesheet" href="https://filmaj.ca/css/filmaj.css" />
  <link rel="stylesheet" href="${arc.static('index.css')}" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css" integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ==" crossorigin=""/>
  ${(process.env.ARC_ENV === 'production' ? '<script data-goatcounter="https://filmaj-photos.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>' : '')}
  <meta property="og:site_name" content="Fil Maj's Photos" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://${process.env.ARC_ENV == 'production' ? 'photos.filmaj.ca' : 'photos-staging.filmaj.ca'}${req.path}" />
  <meta name="twitter:domain" content="${process.env.ARC_ENV == 'production' ? 'photos.filmaj.ca' : 'photos-staging.filmaj.ca'}" />
  <meta name="twitter:card" content="summary">
  <meta name="twitter:site" content="@filmaj">
  <meta name="twitter:creator" content="@filmaj">
  <meta property="og:locale" content="en_CA" />
  ${head.join('\n')}
</head>
<body>
  <div id="container">
${body}
  </div>
</body>
<script src="https://unpkg.com/leaflet@1.8.0/dist/leaflet.js" integrity="sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ==" crossorigin=""></script>
<script type="text/javascript">
WebFontConfig = {
    google: { families: [ 'Source Sans Pro:Semi-Bold', 'Source Serif Pro:Regular', 'Material+Icons' ] }
};
(function() {
  var s = document.getElementsByTagName('script')[0];
  var wf = document.createElement('script');
  wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
  '://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
  wf.type = 'text/javascript'; wf.async = 'true';
  s.parentNode.insertBefore(wf, s);
})();
</script>
${scripts.map(src => `<script type="text/javascript" src="${arc.static(src)}"></script>`).join('\n')}
</html>
`
  };
};

module.exports.avatar = function(target) {
  return `<a href="${target || '/'}" style="float:left;text-decoration:none;"><img src="${arc.static('fil.png')}" width=32 /></a>`;
};
