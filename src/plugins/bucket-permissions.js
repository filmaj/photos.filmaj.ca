module.exports = {
  package: function storage ({ cloudformation: cfn }) {
    // godbucket with all my images
    let bucket = 'photos-filmaj-ca';
    let bucketArn = `arn:aws:s3:::${bucket}`;
    // the @events S3upload SNS topic defined in app.arc
    let s3upload = 'S3uploadEventTopic';
    // First thing we do is add permissions to our image godbucket to our role
    cfn.Resources.PrivateStorageMacroPolicy = {
      Type: 'AWS::IAM::Policy',
      DependsOn: 'Role',
      Properties: {
        PolicyName: 'PrivateStorageMacroPolicy',
        PolicyDocument: {
          Statement: [ {
            Effect: 'Allow',
            Action: [ 's3:*' ],
            Resource: [bucketArn, `${bucketArn}/*`]
          } ]
        },
        Roles: [ { 'Ref': 'Role' } ],
      }
    };
    // add a SNS topic policy for the S3uploadEventTopic for events from our godbucket
    cfn.Resources.S3uploadEventTopicPolicy = {
      Type: 'AWS::SNS::TopicPolicy',
      DependsOn: 'Role',
      Properties: {
        PolicyDocument: {
          Version: '2012-10-17',
          Statement: [ {
            Effect: 'Allow',
            Principal: {
              Service: 's3.amazonaws.com'
            },
            Action: [ 'sns:Publish' ],
            Resource: {'Ref': s3upload },
            Condition: {
              'ArnLike': {
                'aws:SourceArn': `arn:aws:s3:*:*:${bucket}`
              }
            }
          } ]
        },
        Topics: [ { 'Ref': 'S3uploadEventTopic' } ],
      }
    };

    let resKeys = Object.keys(cfn.Resources);

    // Add PHOTO_BUCKET env var with bucket name to all lambdas
    resKeys.forEach((k) => {
      if (cfn.Resources[k].Type === 'AWS::Serverless::Function') {
        cfn.Resources[k].Properties.Environment.Variables['PHOTO_BUCKET'] = bucket;
      }
    });

    return cfn;
  }
};
