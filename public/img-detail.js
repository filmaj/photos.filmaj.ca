function LoadMap() {
  resetContainer();
  // latitude and longitude injected by server side
  let map = L.map('map').setView([latitude, longitude], 5);
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
function resetContainer() {
  let img = document.getElementsByClassName('img-detail')[0].children[1];
  let container = document.getElementById('container');
  console.log('Reseting image width to', img.width);
  container.style.maxWidth=img.width + 'px';
}
window.onload=LoadMap;
window.matchMedia('(orientation: portrait)').addListener(resetContainer);
window.matchMedia('(orientation: landscape)').addListener(resetContainer);
