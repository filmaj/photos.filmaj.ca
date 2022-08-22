@app
photos-filmaj-ca

@aws
profile default
region us-east-1

@http
get /
get /api/randoimg
get /*

@events
s3upload

@tables
exifdata
  key *String

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
