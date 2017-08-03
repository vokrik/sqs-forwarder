const expect = require('chai').expect
const httpSenderFactory = require('../dist/httpSender')
const axios = require('axios')
const sinon = require('sinon')

describe('httpSender', function () {
  let sandbox

  beforeEach('Setup sandbox', function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach('Cleanup sandbox', function () {
    sandbox.restore()
  })
  describe('#sendMessage', function () {
    it('should throw error for missing HTTP url in config', function () {
      const configWithoutUrl = {
        method: 'GET',
        headers: {}
      }
      expect(() => httpSenderFactory(configWithoutUrl)).to.throw('Missing required parameter `url`')
    })
    it('Should make a call with proper parameters', function () {
      const config = {
        url: 'https://test.url',
        method: 'POST',
        headers: {
          'Some header': 'Some value'
        }
      }
      const stubAxios = sandbox.stub(axios, 'request')

      const httpSender = httpSenderFactory(config)
      httpSender.sendMessage('message', arg => arg)
      expect(stubAxios.args[0][0]).to.include({
        url: 'https://test.url',
        method: 'POST',
        data: 'message'
      })
      expect(stubAxios.args[0][0]['headers']).to.include({
        'Some header': 'Some value'
      })
    })

    it('Should guess plain text content type', function () {
      const config = {
        url: 'https://test.url'
      }
      const stubAxios = sandbox.stub(axios, 'request')

      const httpSender = httpSenderFactory(config)
      httpSender.sendMessage('message', arg => arg)
      expect(stubAxios.args[0][0]['headers']).to.include({'Content-type': 'text/plain'})
    })

    it('Should guess json content type', function () {
      const config = {
        url: 'https://test.url'
      }
      const stubAxios = sandbox.stub(axios, 'request')

      const httpSender = httpSenderFactory(config)
      httpSender.sendMessage('{"someKey": "someValue"}', arg => arg)
      expect(stubAxios.args[0][0]['headers']).to.include({'Content-type': 'application/json'})
    })

    it('Should not guess type if Content-type is provided', function () {
      const config = {
        url: 'https://test.url',
        headers: {
          'Content-type': 'some/contentType'
        }
      }
      const stubAxios = sandbox.stub(axios, 'request')

      const httpSender = httpSenderFactory(config)
      httpSender.sendMessage('{"someKey": "someValue"}', arg => arg)
      expect(stubAxios.args[0][0]['headers']).to.include({'Content-type': 'some/contentType'})
    })

    it('Should apply parser to the message', function () {
      const config = {
        url: 'https://test.url'
      }
      sandbox.stub(axios, 'request')
      const mockParser = sinon.expectation.create()
        .once()
        .withArgs('message')

      const httpSender = httpSenderFactory(config)
      httpSender.sendMessage('message', mockParser)
      mockParser.verify()
    })
  })
})
