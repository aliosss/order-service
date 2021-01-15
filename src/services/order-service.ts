import { Order, OrderLine } from '../models/order';
import { readS3File } from '../wrappers/s3-wrapper';
import { putJson, RESPONSE } from '../wrappers/https-wrapper';
import { getLogger } from '../utils/logger';

const logger = getLogger('order-service');
const ORDER_SEND_INTERVAL = parseInt(process.env.ORDER_SEND_INTERVAL);

export async function readOrders(bucket: string, key: string): Promise<Order[]> {
    const ordersAsText = await readS3File({
        Bucket: bucket,
        Key: key
    });

    return toOrders(ordersAsText);
}

export async function sendOrdersPerInterval(orders: Order[]): Promise<void> {
    const expectedOrdersToBeSent = orders.length;
    let sentOrders = 0,
        numOfRequests = 0;

    return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
            const order = orders.pop();
            if (!order) {
                return;
            }

            numOfRequests++;
            putJson('/order', order)
                .then((response) => {
                    if (response != RESPONSE.OK) {
                        logger.warn(`RESPONSE: ${response}: requeing the order.`);
                        orders.push(order);
                        return;
                    }

                    if (++sentOrders === expectedOrdersToBeSent) {
                        logger.debug(`ALL ${sentOrders} orders are sent with ${numOfRequests} requests.`);
                        clearInterval(intervalId);
                        return resolve();
                    }
                })
                .catch(reject);
        }, ORDER_SEND_INTERVAL);
    });
}

export async function sendOrdersSequentially(orders: Order[]): Promise<void> {
    let sentOrders = 0,
        numOfRequests = 0;
    while (orders.length) {
        const order = orders.pop();
        numOfRequests++;
        const response = await putJson('/order', order);
        if (response != RESPONSE.OK) {
            logger.warn(`RESPONSE: ${response}: requeing the order.`);
            orders.push(order);
            return;
        }
        sentOrders++;
    }

    logger.debug(`ALL ${sentOrders} orders are sent with ${numOfRequests} requests.`);
}

function toOrders(text: string): Order[] {
    return text
        .split(/\r?\n/)
        .map(toOrder)
        .filter((order) => order);
}

function toOrder(text: string): Order | null {
    const columns = text.split(',');
    const orderLines = toOrderLines(text[3]);

    return {
        id: columns[0],
        orderDate: toIsoDateString(columns[1]),
        email: columns[2],
        total: orderLines.reduce((sum, orderLine) => sum + orderLine.value, 0),
        orderLines
    };
}

function toOrderLines(text: string): OrderLine[] {
    return text.split(';').map((item) => {
        const props = item.split('|');
        return <OrderLine>{
            productCode: props[0],
            value: parseFloat(props[1])
        };
    });
}

function toIsoDateString(date: string) {
    const monthFirstDate = `${date.substr(3, 2)}.${date.substr(0, 2)}${date.substr(5)}`;
    return new Date(monthFirstDate).toISOString();
}
