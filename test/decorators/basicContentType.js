const expect = require('chai').expect
const basicContentType = require('../../dist/decorators/basicContentType')
describe('decorators', function () {
  describe('basicContentType', function () {
    it('Should add plain text content type', function () {
      const req = {
        data: 'Test plaintext'
      }
      expect(basicContentType(req)['headers']).to.include({'Content-type': 'text/plain'})
    })

    it('Should add json content type', function () {
      const req = {
        data: '{"someKey": "someValue"}'
      }
      expect(basicContentType(req)['headers']).to.include({'Content-type': 'application/json'})
    })

    it('Should not guess type if Content-type is provided', function () {
      const req = {
        data: 'Test plaintext',
        headers: {
          'Content-type': 'some/contentType'
        }
      }
      expect(basicContentType(req)['headers']).to.include({'Content-type': 'some/contentType'})
    })
  })
})
