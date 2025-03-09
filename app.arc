@app
photos-filmaj-ca

@aws
region us-east-1

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
bucket-permissions
  src app/infra/plugins/bucket-permissions.mjs
