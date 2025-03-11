import { updater } from '@architect/utils';
const out = updater('Custom Infra');
import { getBucketName } from './utils.mjs';
// the @events S3upload SNS topic defined in app.arc
const s3upload = 'S3uploadEventTopic';
const defaultLocalOptions = {
  port: 4569,
  address: 'localhost',
  directory: './buckets', // TODO maybe use os.tmpdir and clean up on shutdown?
  accessKeyId: 'S3RVER',
  secretAccessKey: 'S3RVER',
  allowMismatchedSignatures: true,
  resetOnClose: false,
};

export default {
  deploy: {
    start: function infra({ arc, cloudformation: cfn, stage }) {
      const imgBucket = getBucketName(arc.app, stage);
      const appName = arc.app[0];
      const comment = `${appName} (${stage})`;
      cfn.Resources.ImageBucket = {
        Type: 'AWS::S3::Bucket',
        // topic policy needed as it gives S3 principal topic permissions
        DependsOn: ['S3uploadEventTopicPolicy', 'ArcImageBucketAccess'],
        Properties: {
          BucketName: imgBucket,
          // Set up event notifications to trigger the S3upload SNS topic
          NotificationConfiguration: {
            TopicConfigurations: [
              {
                Event: 's3:ObjectCreated:*',
                Topic: { Ref: s3upload },
              },
            ],
          },
        },
      };
      // Create CloudFront origin access identity for S3 bucket
      cfn.Resources.CloudFrontOriginAccessIdentity = {
        Type: 'AWS::CloudFront::CloudFrontOriginAccessIdentity',
        Properties: {
          CloudFrontOriginAccessIdentityConfig: {
            Comment: `OAI for ${comment} image bucket`,
          },
        },
      };
      // Update bucket policy to allow CloudFront OAI access
      cfn.Resources.ImageBucketPolicy = {
        Type: 'AWS::S3::BucketPolicy',
        DependsOn: ['ImageBucket', 'CloudFrontOriginAccessIdentity'],
        Properties: {
          Bucket: imgBucket,
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  CanonicalUser: {
                    'Fn::GetAtt': ['CloudFrontOriginAccessIdentity', 'S3CanonicalUserId'],
                  },
                },
                Action: 's3:GetObject',
                Resource: {
                  'Fn::Join': ['', ['arn:aws:s3:::', imgBucket, '/*']],
                },
              },
            ],
          },
        },
      };
      // Add permissions to our image bucket to our role
      cfn.Resources.ArcImageBucketAccess = {
        Type: 'AWS::IAM::Policy',
        Properties: {
          PolicyName: 'ImageBucketPolicy',
          Description: `${comment} image bucket access`,
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Action: ['s3:*'],
                Resource: [
                  {
                    'Fn::Join': ['', ['arn:aws:s3:::', imgBucket]],
                  },
                  {
                    'Fn::Join': ['', ['arn:aws:s3:::', imgBucket, '/*']],
                  },
                ],
              },
            ],
          },
          Roles: [{ Ref: 'Role' }],
        },
      };
      // add a SNS topic policy for the S3uploadEventTopic for events from our bucket
      cfn.Resources.S3uploadEventTopicPolicy = {
        Type: 'AWS::SNS::TopicPolicy',
        Properties: {
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  Service: 's3.amazonaws.com',
                },
                Action: 'sns:Publish',
                Resource: { Ref: s3upload },
                Description: `Allows S3 to publish events to SNS for ${comment}`,
              },
            ],
          },
          Topics: [{ Ref: s3upload }],
        },
      };
      // Create CloudFront distribution with API Gateway and S3 bucket origins
      cfn.Resources.CDN = {
        Type: 'AWS::CloudFront::Distribution',
        DependsOn: ['HTTP', 'ImageBucket', 'CloudFrontOriginAccessIdentity'],
        Properties: {
          DistributionConfig: {
            Comment: `${arc.app} Photography Site (${stage})`,
            Enabled: true,
            DefaultRootObject: 'index.html',
            HttpVersion: 'http2',
            PriceClass: 'PriceClass_100',
            ViewerCertificate: {
              CloudFrontDefaultCertificate: true,
            },
            Origins: [
              // API Gateway origin (default)
              {
                Id: 'ApiGateway',
                DomainName: {
                  'Fn::Sub': [
                    '${ApiId}.execute-api.${AWS::Region}.amazonaws.com',
                    {
                      ApiId: {
                        Ref: 'HTTP',
                      },
                    },
                  ],
                },
                CustomOriginConfig: {
                  HTTPPort: 80,
                  HTTPSPort: 443,
                  OriginProtocolPolicy: 'https-only',
                  OriginSSLProtocols: ['TLSv1.2'],
                },
              },
              // S3 bucket origin
              {
                Id: 'S3Origin',
                DomainName: { 'Fn::GetAtt': ['ImageBucket', 'DomainName'] },
                S3OriginConfig: {
                  OriginAccessIdentity: {
                    'Fn::Sub':
                      'origin-access-identity/cloudfront/${CloudFrontOriginAccessIdentity}',
                  },
                },
              },
            ],
            // Default behavior - routes to API Gateway
            DefaultCacheBehavior: {
              TargetOriginId: 'ApiGateway',
              ViewerProtocolPolicy: 'redirect-to-https',
              AllowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
              CachedMethods: ['GET', 'HEAD', 'OPTIONS'],
              Compress: true,
              DefaultTTL: 0,
              MinTTL: 0,
              MaxTTL: 86400,
              ForwardedValues: {
                QueryString: true,
                Cookies: {
                  Forward: 'all',
                },
                Headers: ['Authorization', 'Accept', 'Content-Type'],
              },
            },
            // Cache behavior for images - routes to S3 bucket
            CacheBehaviors: [
              {
                PathPattern: '/img/*',
                TargetOriginId: 'S3Origin',
                ViewerProtocolPolicy: 'redirect-to-https',
                AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
                CachedMethods: ['GET', 'HEAD', 'OPTIONS'],
                Compress: true,
                DefaultTTL: 86400,
                MinTTL: 0,
                MaxTTL: 31536000, // 1 year
                ForwardedValues: {
                  QueryString: false,
                  Cookies: {
                    Forward: 'none',
                  },
                },
              },
            ],
          },
        },
      };
      // Export the CloudFront URL
      cfn.Outputs.CDN = {
        Description: `${command} CDN`,
        Value: { 'Fn::GetAtt': ['CloudFrontDistribution', 'DomainName'] },
      };
      return cfn;
    },
    services: async ({ arc, cloudformation, dryRun, inventory, stage }) => {
      const isLocal = stage === 'testing';
      const bucketName = getBucketName(arc.app, stage);
      return {
        ImageBucket: isLocal ? bucketName : { Ref: 'ImageBucket' },
        CDN: isLocal ? 'CDN' : { Ref: 'CDN' },
      };
    },
    end: async ({ cloudformation }) => { },
  },
  sandbox: {
    start: async ({ arc, http }) => {
      const bucketName = getBucketName(arc.app, 'testing');
      http.get('/img/:id', (req, res) => {
        out.status('got a custom http!');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('yo\n');
      });
      const layer = http.stack.pop();
      http.stack.unshift(layer);
      console.log(http.stack[0]);
      const s3rverOptions = { configureBuckets: [{ name: bucketName }], ...defaultLocalOptions };
    },
    end: async ({ arc, inventory, invoke }) => { },
  },
};
