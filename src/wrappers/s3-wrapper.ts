import { S3 } from 'aws-sdk';
import { GetObjectRequest } from 'aws-sdk/clients/s3';

const s3 = new S3();

export async function readS3File(params: GetObjectRequest): Promise<string> {
    const file = await s3.getObject(params).promise();
    return file.Body ? file.Body.toString('utf-8') : '';
}
