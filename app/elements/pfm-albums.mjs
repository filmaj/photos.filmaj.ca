export default function AlbumsList({ html, state }) {
  const { store } = state
  const { albums = [] } = store
  console.log(albums)
  /*
        const cover = await imageUtils.cover(Bucket, p.Prefix, imageUtils.TILE, s3);
        albums += `<li>
          <a href="/${p.Prefix.endsWith('/') ? p.Prefix.substring(0, p.Prefix.length - 1) : p.Prefix}">
            <img src="${imageUtils.URL_BASE}/${p.Prefix}${cover}" />
            <p>${label}</p>
          </a>
        </li>`;
  */

  return html`<pre><code>${JSON.stringify(albums, null, 2)}</code></pre>`
}
