# Simple Order Processing Service

This service has a lambda which is triggered by a file uploaded to S3 bucket.

The file contains orders in each line in a specific format. Lambda function reads all orders from the file. After parsing the orders, it sends them to a PUT api endpoint.

## Issues and considerations

-   PUT api throttles the requests and allows approximately 1 request/second. Parallelization or requesting from different IPs do not help to increase the performance.
-   When the amount of orders is higher than 900, then lambda function cannot process in MAX_TIMEOUT which is 15 minutes.
-   When the orders are much more, this solution would not work. It would take still a long time to process all orders unless target API is improved.

## Improvement points

-   Since the main bottleneck is the order PUT API, the main improvement should be made at that location. Possible improvements to the API:

    -   Scale out to increase rate limit.
    -   Allow BATCH put operations.

-   At lambda side there can be several improvements depending on the expected order load and target API rate limit.
    -   Lamda is designed to run smaller actions. This type of long-running actions is not designed for lambda.
    -   Morover, it is also costly for lambda. With the current rate limit and in this solution, we are waiting in the lambda idle which costs money.
    -   100ms lambda with 128MB costs almost the same as running another lambda. So, instead of adding delays in lambda, it is cheaper to run small lambdas and ditribute by other means.
    -   For long running jobs, also Fargate can be considered since there is no timeout.

## Split reading and sending orders.

### Reading

-   Up until 1M orders in a single file, reading will be done in a couple of seconds.

### Splitting the orders

-   Depending on the load, we can consider different solutions for splitting up the orders. While SQS is a good candidate, on higher loads, AWS Kinesis gives higher throughput especially for writing. SQS also does not work well when Lambda concurrency is limited to low numbers.
-   In a nutsheel, reader lambda will read orders and send events to Kinesis in batches.
-   Once the orders are in a Kinesis stream, then handling/distributing load becomes much easier.

### Sending orders

-   A second lambda who is listening the Kinesis stream will send orders.
-   In this way, we also mitigated the single-point-of-failure problem, where an error in sending one order potentially could replay all orders.
-   Kinesis streams have shards and lambda has concurrency control which can be used to distribute the load.

## Conclusion

-   Cloud services in general are designed to scale-up and out to give higher throughput.
-   There are not many services designed to distribute the work due to incapacity of the third parth API.
-   Best thing I could achieve was using one Kinesis shard + limiting lambda concurrency to 1. However, this will give you a seqquential execution at best. There is no other service or mechanism to futher delay the execution other than application level delays which costs money as said earlier.
-   So, it is time to increase rate-limit of the PUT API.
