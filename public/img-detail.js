function LoadMap() {
  // latitude and longitude injected by server side
  let map = L.map('map').setView([latitude, longitude], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  L.marker([latitude, longitude]).addTo(map);
}
function imgError(evt) {
  console.log('imgerror!', evt.src);
  let album = evt.src.split('filmaj.ca/')[1];
  window.location.replace('/' + album.split('/')[0]);
}
window.onload=LoadMap;
