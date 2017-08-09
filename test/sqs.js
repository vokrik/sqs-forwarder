const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sqsFactory = require('../dist/sqs')
const sinon = require('sinon')

chai.use(chaiAsPromised)
const expect = chai.expect

describe('sqs', function () {
  let sandbox
  const message1 = {
    MessageId: '1',
    ReceiptHandle: 'handle1',
    MD5OfBody: 'df277295a50a1ab4ad101ddce2c0c143',
    Body: JSON.stringify({
      'Type': 'Notification',
      'MessageId': '0a3cbe2d-5bd4-4193-9ac2-ea32dbcba197',
      'TopicArn': 'arn:aws:sns:local:000000000000:local-topic1',
      'Subject': '',
      'Message': 'I am a test message1',
      'TimeStamp': '2017-08-03T08:05:42:008Z'
    })
  }
  const message2 = {
    MessageId: '2',
    ReceiptHandle: 'handle2',
    MD5OfBody: 'df277295a50a1ab4ad101ddce2c0c143',
    Body: JSON.stringify({
      'Type': 'Notification',
      'MessageId': '0a3cbe2d-5bd4-4193-9ac2-ea32dbcba197',
      'TopicArn': 'arn:aws:sns:local:000000000000:local-topic1',
      'Subject': '',
      'Message': 'I am a test message2',
      'TimeStamp': '2017-08-03T08:05:42:008Z'
    })
  }
  const correctConfig =
    {
      url: 'https://test.url',
      apiVersion: '2012-11-05',
      attributeNames: ['Attribute 1', 'Attribute2'],
      messageAttributeNames: ['Attribute3', 'Attribute4'],
      maxMessages: 5,
      visibilityTimeout: 1,
      waitTimeout: 3
    }

  beforeEach('Setup sandbox', function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach('Cleanup sandbox', function () {
    sandbox.restore()
  })

  describe('#getMessages', function () {
    it('should pass supported configuration to the call of SQS', function () {
      const sqs = sqsFactory(correctConfig)
      const mockClient = sandbox.mock(sqs.client)

      mockClient
        .expects('receiveMessage')
        .returns({
          promise: sandbox.stub().returns(Promise.resolve({Messages: []}))
        })
        .once()
        .withArgs({
          QueueUrl: correctConfig.url,
          AttributeNames: correctConfig.attributeNames,
          MessageAttributeNames: correctConfig.messageAttributeNames,
          MaxNumberOfMessages: correctConfig.maxMessages,
          VisibilityTimeout: correctConfig.visibilityTimeout,
          WaitTimeSeconds: correctConfig.waitTimeout
        })
      sqs.getMessages()
      mockClient.verify()
    })
    it('should throw error for missing SQS url in config', function () {
      const configWithoutUrl = {
        apiVersion: '2012-11-05',
        attributeNames: ['Attribute 1', 'Attribute2'],
        messageAttributeNames: ['Attribute3', 'Attribute4'],
        maxMessages: 5,
        visibilityTimeout: 1,
        waitTimeout: 3
      }
      expect(() => sqsFactory(configWithoutUrl)).to.throw('Missing required parameter `url`')
    })

    it('should return an array of messages for existing queue', function () {
      const messages = [message1, message2]
      const sqs = sqsFactory(correctConfig)

      sandbox.stub(sqs.client, 'receiveMessage').returns({
        promise: sandbox.stub().returns(Promise.resolve({Messages: JSON.parse(JSON.stringify(messages))}))
      })

      return expect(sqs.getMessages()).to.eventually.deep.equal(messages)
    })

    it('should reject if the response from sqs returns an error', function () {
      const sqs = sqsFactory(correctConfig)
      sandbox.stub(sqs.client, 'receiveMessage').returns({
        promise: sandbox.stub().returns(Promise.reject(new Error()))
      })
      return expect(sqs.getMessages()).to.eventually.be.rejected
    })
  })
  describe('#deleteMessage', function () {
    it('should pass supported configuration to the call of SQS', function () {
      const sqs = sqsFactory(correctConfig)
      const mockClient = sandbox.mock(sqs.client)
      mockClient
        .expects('deleteMessage')
        .returns({
          promise: sandbox.stub().returns(Promise.resolve())
        })
        .once()
        .withArgs({
          QueueUrl: correctConfig.url,
          ReceiptHandle: message1.ReceiptHandle
        })
      sqs.deleteMessage(message1)
      mockClient.verify()
    })

    it('should reject if the response from sqs returns an error', function () {
      const sqs = sqsFactory(correctConfig)
      sandbox.stub(sqs.client, 'deleteMessage').returns({
        promise: sandbox.stub().returns(Promise.reject(new Error()))
      })
      return expect(sqs.deleteMessage(message1)).to.eventually.be.rejected
    })

    it('should throw an error if the massage does not have MessageId', function () {
      const sqs = sqsFactory(correctConfig)
      const message = JSON.parse(JSON.stringify(message1))
      delete message.MessageId
      return expect(sqs.deleteMessage(message)).to.eventually.be.rejectedWith('Invalid SQS message structure')
    })

    it('should throw an error if the massage is not passed', function () {
      const sqs = sqsFactory(correctConfig)
      return expect(sqs.deleteMessage()).to.eventually.be.rejectedWith('Invalid SQS message structure')
    })

    it('should throw an error if the massage does not have ReceiptHandle', function () {
      const sqs = sqsFactory(correctConfig)
      const message = JSON.parse(JSON.stringify(message1))
      delete message.ReceiptHandle
      return expect(sqs.deleteMessage(message)).to.eventually.be.rejectedWith('Invalid SQS message structure')
    })
  })
})
