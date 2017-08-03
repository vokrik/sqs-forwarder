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
    sendMessage: async (message, messageParser) => {
      let parsedMessage = messageParser(message)
      const req = Object.assign(defaultRequestConfig, {data: parsedMessage})

      if (!req.headers.hasOwnProperty('Content-type')) {
        try {
          JSON.parse(parsedMessage) // Check, if it throws an exception (usual way of checking for JSON)
          req.headers['Content-type'] = 'application/json'
        } catch (err) {
          req.headers['Content-type'] = 'text/plain'
        }
      }
      log('Forwarding message %s', message.MessageId)

      return axios.request(req)
    }
  }
}
