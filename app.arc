@app
photos-filmaj-test

@aws
region us-east-1
runtime nodejs22.x

@events
s3upload
  src app/infra/events/s3upload

@tables
exifdata
  key *String
  PointInTimeRecovery true

@tables-indexes
exifdata
  album *String
  views **Number
  name AlbumByViews

@static
fingerprint true

@plugins
enhance/arc-plugin-enhance
enhance/arc-plugin-block-bots
custom-infra
  src app/infra/plugins/custom-infra.mjs
