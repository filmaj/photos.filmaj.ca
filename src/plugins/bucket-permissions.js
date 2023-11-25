// godbucket with all my images
const bucket = 'photos-filmaj-ca';
const bucketArn = `arn:aws:s3:::${bucket}`;
// the @events S3upload SNS topic defined in app.arc
const s3upload = 'S3uploadEventTopic';

module.exports = {
  deploy: {
    start: function storage ({ cloudformation: cfn }) {
      // console.log('bucket plugin cfn', cfn);
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
          Topics: [ { 'Ref': s3upload } ],
        }
      };

      let resKeys = Object.keys(cfn.Resources);

      // Add PHOTO_BUCKET env var with bucket name to all lambdas
      resKeys.forEach((k) => {
        if (cfn.Resources[k].Type === 'AWS::Serverless::Function') {
          cfn.Resources[k].Properties.Environment.Variables['PHOTO_BUCKET'] = bucket;
        }
      });

      // Also rewrite the static url so it doesnt conflict with the /album/image route
      cfn.Resources.HTTP.Properties.DefinitionBody.paths['/a/_static/{proxy+}'] = cfn.Resources.HTTP.Properties.DefinitionBody.paths['/_static/{proxy+}'];
      delete cfn.Resources.HTTP.Properties.DefinitionBody.paths['/_static/{proxy+}'];

      return cfn;
    }
  }
};
