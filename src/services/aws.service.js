import AWS from 'aws-sdk'

AWS.config.update({
  accessKeyId: process.env.VUE_APP_S3_ACCESS_KEY,
  secretAccessKey: process.env.VUE_APP_S3_SCRT,
  region: process.env.VUE_APP_S3_REGION,
});

const s3 = new AWS.S3()

export default s3