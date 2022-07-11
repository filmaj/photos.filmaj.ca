const arc = require('@architect/functions');

module.exports = function layout({ title, body, scripts }) {
  scripts = scripts || [];
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
  <link rel="stylesheet" href="${arc.static('index.css')}" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css" integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ==" crossorigin=""/>
  ${(process.env.ARC_ENV === 'production' ? '<script async src="https://www.googletagmanager.com/gtag/js?id=G-GPE1GXNEM5"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag("js", new Date());gtag("config", "G-GPE1GXNEM5");</script>' : '')}
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

module.exports.avatar = function() {
  return `<a href="/" style="float:left;text-decoration:none;"><img src="${arc.static('fil.png')}" width=32 /></a>`;
};
