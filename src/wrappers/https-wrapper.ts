import * as https from 'https';

export enum RESPONSE {
    OK = 'OK',
    THROTTLED = 'THROTTLED',
    ERROR = 'ERROR'
}

export async function putJson(path: string, body: unknown): Promise<RESPONSE> {
    const options: https.RequestOptions = {
        hostname: process.env.HOST,
        port: 443,
        path: `/Prod${path}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        agent: new https.Agent({ keepAlive: true })
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                return resolve(RESPONSE.OK);
            }

            if (res.statusCode === 429) {
                return resolve(RESPONSE.THROTTLED);
            }
        });

        req.on('error', () => resolve(RESPONSE.ERROR));
        req.write(JSON.stringify(body));
        req.end();
    });
}
