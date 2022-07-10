let arc = require('@architect/functions');

exports.handler = async function somethingWasUploadedToS3(event) {
  console.log(JSON.stringify(event, null, 2))
};
