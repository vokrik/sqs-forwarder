const debug = require('debug')
const log = debug(('sqs-forwarder:decorators:auth0'))
const moment = require('moment')
const axios = require('axios')

const EXPIRATION_BUFFER = 60 // How long before expiration will we fetch a new token

module.exports = (domain, clientId, clientSecret, audience, cache, urlPath='oauth/token') => {
  return async (req) => {
    let result = JSON.parse(JSON.stringify(req)) // deep clone
    if (!result.headers) {
      result.headers = {}
    }
    log('Using auth0 with %s cache', cache ? 'enabled' : 'disabled')

    const token = cache ? await getTokenFromCache() : await getToken()
    result.headers['Authorization'] = `${token.token_type} ${token.access_token}`
    return result
  }

  async function getTokenFromCache () {
    if (!isValidToken(cache.token)) {
      log('Refreshing token cache')
      cache.token = await getToken()
    }
    return cache.token
  }

  async function getToken () {
    const options = {
      method: 'POST',
      baseURL: `https://${domain}/`,
      url: urlPath,
      data: {
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: 'client_credentials'
      },
      responseType: 'json'
    }

    const response = await axios.request(options)
    const token = response.data

    const expiresWithBuffer = token.expires_in - EXPIRATION_BUFFER < 0 ? 0 : token.expires_in - EXPIRATION_BUFFER
    token.expiresAfter = moment().add(expiresWithBuffer, 'seconds')
    return token
  }

  function isValidToken (token) {
    if (!token) {
      log('Token does not exist')
      return false
    }
    if (!token.access_token || !token.expiresAfter) {
      log('Token has a wrong format')
    }
    if (moment().isAfter(token.expiresAfter)) {
      log('Token is expired')

      return false
    }

    return true
  }
}
