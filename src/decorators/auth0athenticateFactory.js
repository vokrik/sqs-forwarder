var AuthenticationClient = require('auth0').AuthenticationClient
const debug = require('debug')
const log = debug(('sqs-forwarder:decorators:auth0'))
const moment = require('moment')

const EXPIRATION_BUFFER = 60 // How long before expiration will we fetch a new token

module.exports = (domain, clientId, clientSecret, audience, cache) => {
  const useCache = !!cache // Old trick how to convert type to boolean

  const auth0 = new AuthenticationClient({
    domain,
    clientId,
    clientSecret
  })

  return async (req) => {
    let result = JSON.parse(JSON.stringify(req)) // deep clone
    if (!result.headers) {
      result.headers = {}
    }
    log('Using auth0 with %s cache', useCache ? 'enabled' : 'disabled')

    const token = useCache ? await getTokenFromCache() : await getToken()
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
    const token = await auth0.clientCredentialsGrant({audience})

    const expiresWithBuffer = token.expires_in - EXPIRATION_BUFFER < 0 ? 0 : token.expires_in - EXPIRATION_BUFFER
    token.expiresAfter = moment().add(expiresWithBuffer, 'seconds')
    console.log(token)
    return token
  }

  function isValidToken (token) {
    if (!token) {
      log('Token does not exist')
      return false
    }
    if (!token.access_token || !token.access_token || !token.expiresAfter) {
      log('Token has a wrong format')
    }
    if (moment().isAfter(token.expiresAfter)) {
      log('Token is expired')

      return false
    }

    return true
  }
}
