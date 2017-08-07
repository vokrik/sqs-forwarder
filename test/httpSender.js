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
      httpSender.sendMessage('message')
      expect(stubAxios.args[0][0]).to.include({
        url: 'https://test.url',
        method: 'POST',
        data: 'message'
      })
      expect(stubAxios.args[0][0]['headers']).to.include({
        'Some header': 'Some value'
      })
    })

    it('Should apply decorator to the message', function () {
      const config = {
        url: 'https://test.url'
      }
      sandbox.stub(axios, 'request')
      const decoratorSpy = sandbox.spy()

      const httpSender = httpSenderFactory(config)
      httpSender.sendMessage('message', [decoratorSpy])
      expect(decoratorSpy.called).to.be.true
    })
  })
})
