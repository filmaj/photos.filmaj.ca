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
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
</head>
<body>
${body}
${(process.env.ARC_ENV === 'staging' ? '<pre><code>' + JSON.stringify(req, null, 2) + '</code></pre>' : '')}
</body>
<script src="https://cdn.jsdelivr.net/npm/exif-js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/dayjs.min.js" integrity="sha512-bwD3VD/j6ypSSnyjuaURidZksoVx3L1RPvTkleC48SbHCZsemT3VKMD39KknPnH728LLXVMTisESIBOAb5/W0Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/customParseFormat.min.js" integrity="sha512-nbPJ/ANJ1DCwUWGyfS+PY7RMysy5UnFyOzPTjzcphOuVbUqrukQAZ9kkNvTkPmItJRuuL5IqNufQTHPyxxpmig==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/relativeTime.min.js" integrity="sha512-7YYTlJ8OTdmDMztOy8q+zfRI/+y/IWnVp1oS4kiTKa+X2P09k/ObWUemEjtMoumu8v4A0s1NZu7WjfR+UxhRCQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/localizedFormat.min.js" integrity="sha512-webaelc41/yR5a3vWQMwU1o6nqNPlwiiF9T4UfUJjGb/+jTHvpd7Xbj1d4IkHTxrjOnrl04W2D6ytruI9NNWhw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/utc.min.js" integrity="sha512-TU4ndEYOqql+pMXn14M8RDWsjjD+VPUA2RoWSuuFd+blPJW4oLrL1w1zAGdlrk4jsE2FEBH5CU3+fmogVYEqIQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.7/plugin/timezone.min.js" integrity="sha512-72V2JNSAxd3rsQIpDSAbCTQXD6gi91Cd/IFZ6NYwRjZSiIlIJfDrJLXq+UomWstOg+zGHWFfkTDl3APEUMoqlw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script type="text/javascript">dayjs.extend(dayjs_plugin_customParseFormat);dayjs.extend(dayjs_plugin_relativeTime);dayjs.extend(dayjs_plugin_localizedFormat);dayjs.extend(dayjs_plugin_utc);dayjs.extend(dayjs_plugin_timezone);</script>
${scripts.map(src => `<script type="text/javascript" src="${arc.static(src)}"></script>`)}
</html>
`
  };
};
