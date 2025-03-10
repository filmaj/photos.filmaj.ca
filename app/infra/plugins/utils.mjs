// use a global for bucket name so that the various plugin methods, when running in sandbox, generate a bucket name once and reuse that
let bukkit;
export function getBucketName(appname, stage) {
  if (bukkit) return bukkit;
  bukkit = generateBucketName(appname[0], stage);
  return bukkit;
}

export function generateBucketName(app, stage) {
  // this can be tricky as S3 Bucket names can have a max 63 character length
  // so the math ends up like this:
  // - ${stage} can have a max length of 10 (for "production") - tho even this
  //   is not exact as custom stage names can be provided and could be longer!
  // - "-img-bucket-" is 12
  // - account IDs are 12 digits
  // = 34 characters
  // that leaves 29 characters for the app name
  // so lets cut it off a bit before that
  const appLabel = app.substr(0, 24);
  if (stage === 'testing') {
    // In sandbox, we need to provide a simple string for the S3 mock server
    return `${appLabel}-${stage}-img-bucket-123456789012`;
  }
  // For cloudformation, though, we need to use the Sub function to sub in the
  // AWS account ID
  return {
    'Fn::Sub': `${appLabel}-${stage}-img-bucket-\${AWS::AccountId}`,
  };
}
