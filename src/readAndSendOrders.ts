import { S3Event } from 'aws-lambda';
import { readOrders, sendOrdersPerInterval } from './services/order-service';
import { getLogger } from './utils/logger';

const logger = getLogger('handle-orders');

export const handler = async (event: S3Event): Promise<void> => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;

    logger.debug(`Received event: ${bucket}:${key}`);

    const orders = await readOrders(bucket, key);

    logger.debug(`Received ${orders.length} orders`);

    await sendOrdersPerInterval(orders);
};
