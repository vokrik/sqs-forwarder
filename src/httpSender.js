const axios = require('axios')
const debug = require('debug')
const log = debug(('sqs-forwarder:http'))
log.log = console.log.bind(console)

module.exports = (userConfig) => {
  const config = Object.assign({
    method: 'POST',
    headers: {}
  }, userConfig)

  const defaultRequestConfig = {
    url: config.url,
    method: config.method,
    headers: config.headers
  }

  if (!config.url) {
    throw new Error('Missing required parameter `url`')
  }

  return {
    sendMessage: async (message, decorators = []) => {
      let req = Object.assign(defaultRequestConfig, {data: message})

      log('Applying decorators for message %s', message.MessageId)
      for (const decorator of decorators) {
        req = decorator(req)
      }

      log('Forwarding message %s', message.MessageId)

      return axios.request(req)
    }
  }
}
