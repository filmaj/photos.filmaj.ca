@app
photos-filmaj-ca

@aws
profile default
region us-east-1

@http
get /
get /:album
get /:album/:image
get /api/randoimg

@events
s3upload

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
ignore
  .eslintrc.js

@plugins
bucket-permissions
