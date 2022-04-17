@app
photos-filmaj-ca

@aws
profile default
region us-east-1

@http
get /
get /api/randoimg
get /*

@static
fingerprint true
ignore
  .eslintrc.js

@plugins
bucket-permissions
