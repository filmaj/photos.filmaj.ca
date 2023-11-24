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
<html lang="en-CA">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="apple-touch-icon" sizes="120x120" href="https://filmaj.ca/img/favicons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="https://filmaj.ca/img/favicons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="https://filmaj.ca/img/favicons/favicon-16x16.png">
  <link rel="stylesheet" href="https://use.typekit.net/cwg3htt.css">
  <link rel="stylesheet" href="https://filmaj.ca/css/reset.css" />
  <link rel="stylesheet" href="https://filmaj.ca/css/filmaj.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="${arc.static('index.css')}" />
  ${(process.env.ARC_ENV === 'production' ? '<script data-goatcounter="https://filmaj-photos.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>' : '')}
  <meta property="og:site_name" content="Fil Maj's Photos" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://${process.env.ARC_ENV == 'production' ? 'photos.filmaj.ca' : 'photos-staging.filmaj.ca'}${req.path}" />
  <meta property="og:locale" content="en_CA" />
  ${head.join('\n')}
</head>
<body class="flow">
  <header>
    <h1><a href="/">Fil&nbsp;Maj's Photos</a></h1>
    <a href="https://filmaj.ca" target="_blank"><img src="https://filmaj.ca/img/me/fil.svg" alt="Fil Maj's avatar" /></a>
  </header>
  <main>
${body}
    <footer>
      <div id="copyright">
        ©&nbsp;2014-${new Date().getFullYear()} Filip&nbsp;Maj
      </div>
      <div id="powered">
        <span>Powered&nbsp;by</span>
        <a href="https://arc.codes" target="_blank">
          <img src="${arc.static('arc.svg')}" alt="Architect framework logo" />
        </a>
      </div>
    </footer>
  </main>
</body>
${scripts.map(src => `<script type="text/javascript" src="${src.startsWith('http://') || src.startsWith('https://') ? src : arc.static(src)}"></script>`).join('\n')}
</html>
`
  };
};
