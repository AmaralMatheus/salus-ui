import AWS from 'aws-sdk'

AWS.config.update({
  accessKeyId: 'AKIA2S2Y4DDP6IRLQOE5',
  secretAccessKey: '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',
  region: 'us-east-2'
});

const s3 = new AWS.S3()

export default s3