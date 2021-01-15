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

-
