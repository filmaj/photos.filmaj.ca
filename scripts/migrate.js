let { ARC_APP_NAME: app, ARC_ENV: env, ARC_STACK_NAME: stack, AWS_REGION, DRY_RUN, LIMIT } = process.env;
if (!app || !env || !stack || !AWS_REGION) throw new Error('Need all of the following env vars set: ARC_APP_NAME, ARC_ENV, ARC_STACK_NAME, AWS_REGION');
let arc = require('@architect/functions');
// dry run option
const dryRun = !!DRY_RUN;
// limit option
const Limit = !!LIMIT;
// TODO: sampling option

(async function go() {
  let tables = await arc.tables();
  let db = tables.exifdata;
  let lastEvalKey;
  do {
    console.log(`Scanning page ${lastEvalKey ? `with key=${lastEvalKey}` : '1'}`);
    // get next page of all records
    const { Items, LastEvaluatedKey } = await db.scan({
      ExclusiveStartKey: lastEvalKey,
      Limit,
    });

    lastEvalKey = LastEvaluatedKey;

    // Run migration on them
    let updatedItems = Items.map(update);
    // save it to DynamoDB
    if (!dryRun) await save(updatedItems, tables);
  } while(!Limit && lastEvalKey);
})();

// Add custom migration logic here
function update(record) {
  return record;
  const key = record.key;
  const slash = key.indexOf('/');
  record.album = key.substring(0, slash + 1);
  record.filename = key.substring(slash + 1);
  // flatten exif data
  normalizeExifTag(record, 'Artist', 'artist');
  normalizeExifTag(record, 'DateTime', 'date');
  normalizeExifTag(record, 'ISOSpeedRatings', 'iso');
  normalizeExifTag(record, 'FocalLength', 'focalLength');
  normalizeExifTag(record, 'FNumber', 'fNumber');
  normalizeExifTag(record, 'ExposureTime', 'exposure');
  normalizeExifTag(record, 'Lens', 'lens');
  normalizeExifTag(record, 'Model', 'model');
  normalizeExifTag(record, 'UserComment', 'comment');
  if (!record.raw) {
    record.raw = { GPSLatitude: record.GPSLatitude, GPSLongitude: record.GPSLongitude, GPSLatitudeRef: record.GPSLatitudeRef, GPSLongitudeRef: record.GPSLongitudeRef };
    delete record.GPSLatitude;
    delete record.GPSLatitudeRef;
    delete record.GPSLongitude;
    delete record.GPSLongitudeRef;
  }
  if (!record.height) {
    record.height = record.ImageHeight.value;
    delete record.ImageHeight;
  }
  if (!record.width) {
    record.width = record.ImageWidth.value;
    delete record.ImageWidth;
  }
  return record;
}
function normalizeExifTag(record, pre, post) {
  if (!record[post] && record[pre]) {
    const old = record[pre];
    record[post] = typeof old === 'string' ? old :
      old.description ||
      (typeof old.value === 'string' ? old.value : (
        old.value instanceof Array && old.value.length === 1 ? old.value[0] : old.value));
  }
  delete record[pre];
  return record;
}

async function save(items, client) {
  const awsDocClient = client._doc;
  const TableName = client.name('exifdata');
  let batch = [];
  // TODO: probably can be smarter than a loop, slice into array instead.. whatever
  for (let item of items) {
    batch.push(item);
    if (batch.length >= 25) {
      await write(awsDocClient, TableName, batch);
      batch = [];
    }
  }
  await write(awsDocClient, TableName, batch);
}

async function write(client, TableName, batch) {
  if (batch.length > 0) {
    console.log(`Batch writing ${batch.length} records; here's a sneak peak of one record:`);
    console.log(JSON.stringify(batch[0]));
    await client.batchWrite({
      RequestItems: {
        [TableName]: batch.map((record) => ({
          PutRequest: {
            Item: record
          }
        }))
      }
    }).promise();
  }
}
