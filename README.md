# sqs-forwarder
This project will help you out if you want to consume messages from SQS by an HTTP endpoint. The library will
take configured amount of messages and send them to the specified url.

It can be nicely used in a lambda that is triggered by a timer. To test things out, there is a way how to run the service locally:

## Running service locally

In order to run this service locally, you need to mock the AWS resources (SQS + SNS) and also the receiving HTTP server.
Commands:
### Instalation
* Install serverless globally (you only need to do this once)
`npm install serverless -g`

##### Install packages

`npm install`

##### Install mock aws services
`docker run -d --name goaws -p 4100:4100 pafortin/goaws`

##### Install server that will console log everything
`npm install console-log-server --global`

##### (Optional) If stopped, start the goaws again (for example you restarted the PC)
`docker start goaws`

##### Run the logging server
`console-log-server --port 3000`

##### Export the AWS_REGION to your environment**
`export AWS_REGION=eu-west-1`

** There is an annoying legacy dependency of some `aws-sdk` services on the AWS_REGION env variable.
Make sure that before you run your service, this variable is set up (it is populated by AWS themselves in staging and prod)

Now you should have everything ready to invoke your function locally.

### Running
To run the service, simply run `npm run start-example` - This should work out of the box.

In the beginning, this will probably process 0 messages, since the queue is empty. In order to see something, you should push a message to the SNS.
Easiest way how to do that is importing the swagger file for the SNS endpoint from this URL `https://www.getpostman.com/collections/091386eae8c70588348e`
You can set the {{URL}} variable to localhost:4100 so you don't have to fill anything.

After you have the collection, locate the Publish endpoint, and change the TopicArn to `arn:aws:sns:local:000000000000:local-topic1`.
This will publish the message to `http://localhost:4100/queue/local-queue3` which is set up for dev to be consumed.

