function getExif() {
  let imgs = Array.from(document.getElementsByTagName('img'));
  console.log('loading exif from img tags...');
  Promise.all(imgs.map(img => new Promise((resolve, reject) => {
    let container = img.parentNode;
    let comment = container.children[1];
    let details = container.children[2];
    EXIF.getData(img, function() {
      let tags = EXIF.getAllTags(this);
      let date = dayjs(`${tags.DateTime} -0500`, 'YYYY:MM:DD HH:mm:ss ZZ');
      let dateEl = details.getElementsByClassName('date')[0];
      let timestamp = date.unix();
      dateEl.setAttribute('timestamp', timestamp);
      details.getElementsByClassName('camera')[0].innerHTML = `${tags.Model}`;
      details.getElementsByClassName('iso')[0].innerText = `ISO ${tags.ISOSpeedRatings}`;
      let focal = tags.FocalLength.numerator / tags.FocalLength.denominator;
      details.getElementsByClassName('focal')[0].innerText = `${focal} mm`;
      let fstop = tags.FNumber.numerator / tags.FNumber.denominator;
      details.getElementsByClassName('fstop')[0].innerText = `f/${fstop}`;
      let exposure = `${tags.ExposureTime.numerator}/${tags.ExposureTime.denominator} s`;
      details.getElementsByClassName('exposure')[0].innerText = exposure;
      comment.innerText = String.fromCharCode(...tags.UserComment.slice(8));
      resolve({ container, timestamp });
      let lat = sexaToDecimal(tags.GPSLatitude);
      let lon = sexaToDecimal(tags.GPSLongitude);
      if (tags.GPSLatitudeRef === 'S') lat = lat * -1;
      if (tags.GPSLongitudeRef === 'W') lon = lon * -1;
      let timezone = tzlookup(lat, lon);
      let zonedDate = date.tz(timezone);
      let displayDate = `${zonedDate.format('LLL')}<br/>${date.fromNow()}`;
      dateEl.innerHTML = displayDate;
      console.log(tags.DateTime, tags);
    });
  }))).then((values) => {
    if (values.length > 1) {
      console.log('all image exif tags processed, reordering pictures...');
      values.sort((a, b) => b.timestamp < a.timestamp);
      let newHTML = values.map(i => i.container.outerHTML).join('\n');
      document.getElementsById('gallery').innerHTML = newHTML;
    }
  }).catch(console.error);
}
// window.onload=getExif;
function sexaToDecimal(coord) {
  let dec = coord[0]; // degrees
  let sec = coord[2] / 60; // seconds
  let min = (coord[1] + sec) / 60; // minutes
  return dec + min;
}
