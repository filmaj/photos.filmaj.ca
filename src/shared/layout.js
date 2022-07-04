const arc = require('@architect/functions');

module.exports = function layout({ title, body, req, scripts }) {
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
  <link rel="stylesheet" href="${arc.static('index.css')}" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css" integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ==" crossorigin=""/>
  ${(process.env.ARC_ENV === 'production' ? '<script async src="https://www.googletagmanager.com/gtag/js?id=G-GPE1GXNEM5"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag("js", new Date());gtag("config", "G-GPE1GXNEM5");</script>' : '')}
</head>
<body>
${body}
${(process.env.ARC_ENV === 'staging' ? '<pre style="display:none;"><code>' + JSON.stringify(req, null, 2) + '</code></pre>' : '')}
</body>
<script src="https://cdn.jsdelivr.net/npm/exif-js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/dayjs.min.js" integrity="sha512-bwD3VD/j6ypSSnyjuaURidZksoVx3L1RPvTkleC48SbHCZsemT3VKMD39KknPnH728LLXVMTisESIBOAb5/W0Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/customParseFormat.min.js" integrity="sha512-nbPJ/ANJ1DCwUWGyfS+PY7RMysy5UnFyOzPTjzcphOuVbUqrukQAZ9kkNvTkPmItJRuuL5IqNufQTHPyxxpmig==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/relativeTime.min.js" integrity="sha512-7YYTlJ8OTdmDMztOy8q+zfRI/+y/IWnVp1oS4kiTKa+X2P09k/ObWUemEjtMoumu8v4A0s1NZu7WjfR+UxhRCQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/localizedFormat.min.js" integrity="sha512-webaelc41/yR5a3vWQMwU1o6nqNPlwiiF9T4UfUJjGb/+jTHvpd7Xbj1d4IkHTxrjOnrl04W2D6ytruI9NNWhw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/utc.min.js" integrity="sha512-TU4ndEYOqql+pMXn14M8RDWsjjD+VPUA2RoWSuuFd+blPJW4oLrL1w1zAGdlrk4jsE2FEBH5CU3+fmogVYEqIQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/timezone.min.js" integrity="sha512-72V2JNSAxd3rsQIpDSAbCTQXD6gi91Cd/IFZ6NYwRjZSiIlIJfDrJLXq+UomWstOg+zGHWFfkTDl3APEUMoqlw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://unpkg.com/leaflet@1.8.0/dist/leaflet.js" integrity="sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ==" crossorigin=""></script>
<script type="text/javascript">dayjs.extend(dayjs_plugin_customParseFormat);dayjs.extend(dayjs_plugin_relativeTime);dayjs.extend(dayjs_plugin_localizedFormat);dayjs.extend(dayjs_plugin_utc);dayjs.extend(dayjs_plugin_timezone);
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
