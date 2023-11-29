import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as s3 from "@aws-sdk/client-s3";

const bucket = new aws.s3.Bucket("pk-file-test", {
    forceDestroy: true
});

const bucketObject = new aws.s3.BucketObject("bucketObject", {
    bucket: bucket.bucket,
    source: new pulumi.asset.FileAsset("file"),
    key: "file"
});

const awsRegion = aws.getRegionOutput();

export const fileContents = pulumi.all([bucket.bucket, bucketObject.key, awsRegion.name]).apply(([bucketName, objectKey, regionName]) => {
    const client = new s3.S3Client({region: regionName});
    const command = new s3.GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey
    });
    return client.send(command).then(x => x.Body?.transformToString());
});

