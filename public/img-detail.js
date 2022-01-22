function getExif() {
  let img = document.getElementsByClassName('img-detail')[0].children[0];
  let comment = document.getElementsByClassName('comment')[0];
  let details = document.getElementsByClassName('shot-details')[0];
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
}
window.onload=getExif;
function sexaToDecimal(coord) {
  let dec = coord[0]; // degrees
  let sec = coord[2] / 60; // seconds
  let min = (coord[1] + sec) / 60; // minutes
  return dec + min;
}
