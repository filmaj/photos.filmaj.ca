let { toLogicalID } = require('@architect/utils');

module.exports = {
  package: function storage ({ cloudformation: cfn }) {
    console.log('inside storage plugin');
    let bucket = 'photos-filmaj-ca';
    // First thing we do is declare a role for our macro resources
    cfn.Resources.PrivateStorageMacroPolicy = {
      Type: 'AWS::IAM::Policy',
      DependsOn: 'Role',
      Properties: {
        PolicyName: 'PrivateStorageMacroPolicy',
        PolicyDocument: {
          Statement: [ {
            Effect: 'Allow',
            Action: [ 's3:*' ],
            Resource: [`arn:aws:s3:::${bucket}`, `arn:aws:s3:::${bucket}/*`]
          } ]
        },
        Roles: [ { 'Ref': 'Role' } ],
      }
    };

    let resKeys = Object.keys(cfn.Resources);

    // Add PHOTO_BUCKET env var with bucket name to all lambdas
    resKeys.forEach((k) => {
      if (cfn.Resources[k].Type === 'AWS::Serverless::Function') {
        cfn.Resources[k].Properties.Environment.Variables[`PHOTO_BUCKET`] = bucket;
      }
    });

    return cfn;
  }
};
