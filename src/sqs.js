const AWS = require('aws-sdk')
const debug = require('debug')
const log = debug('sqs-forwarder:sqs')
log.log = console.log.bind(console)

module.exports = (userConfig) => {
  const config = Object.assign({
    apiVersion: '2012-11-05',
    attributeNames: ['All'],
    messageAttributeNames: ['All'],
    maxMessages: 10,
    visibilityTimeout: 20,
    waitTimeout: 20
  }, userConfig)

  if (!config.url) {
    throw new Error('Missing required parameter `url`')
  }

  const client = new AWS.SQS({apiVersion: config.apiVersion})

  return {
    client, // For testing
    getMessages,
    deleteMessage
  }

  async function getMessages () {
    log(`Getting up to %d messages`, config.maxMessages)
    let params = {
      QueueUrl: config.url,
      AttributeNames: config.attributeNames,
      MessageAttributeNames: config.messageAttributeNames,
      MaxNumberOfMessages: config.maxMessages,
      VisibilityTimeout: config.visibilityTimeout,
      WaitTimeSeconds: config.waitTimeout
    }

    return new Promise((resolve, reject) => {
      client.receiveMessage(params, (err, response) => {
        if (err) {
          return reject(err)
        }
        const messages = response.Messages ? response.Messages : []
        log(`Found %d messages`, messages.length)
        resolve(messages)
      })
    })
  }

  async function deleteMessage (message) {
    if (!message || !message.MessageId || !message.ReceiptHandle) {
      throw new Error('Invalid SQS message structure')
    }

    log('Deleting message with ID: %s', message.MessageId)

    let params = {
      QueueUrl: config.url,
      ReceiptHandle: message.ReceiptHandle
    }

    return new Promise((resolve, reject) => {
      client.deleteMessage(params, function (err) {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }
}
