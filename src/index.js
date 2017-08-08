const sqsFactory = require('./sqs')
const httpSenderFactory = require('./httpSender')
const snsMessageParserDecorator = require('./decorators/snsMessageParser')
const basicContentTypeDecorator = require('./decorators/basicContentType')
const auth0authenticateDecoratorFactory = require('./decorators/auth0athenticateFactory')
const error = require('debug')('sqs-forwarder')

module.exports = (userConfig) => {
  const config = Object.assign({
    sqs: {},
    http: {}
  }, userConfig)

  const sqs = sqsFactory(config.sqs)
  const httpSender = httpSenderFactory(config.http)

  return {
    process: async (decorators = []) => {
      if (typeof decorators === 'function') {
        decorators = [decorators]
      }
      const status = {
        success: 0,
        error: 0
      }

      const messages = await sqs.getMessages()
      for (const message of messages) {
        try {
          await httpSender.sendMessage(message, decorators)
        } catch (err) {
          error('Failed to forward message, we will try next time \n Error: %O \n Original message: %o', err, message)
          status.error++
          continue
        }
        try {
          await sqs.deleteMessage(message)
        } catch (err) {
          error('Failed to delete message. It will be sent probably multiple times \n Error: %O \n Original message: %O', err, message)
          status.error++
          continue
        }
        status.success++
      }
      return status
    },
    snsMessageParserDecorator,
    basicContentTypeDecorator,
    auth0authenticateDecoratorFactory
  }
}
