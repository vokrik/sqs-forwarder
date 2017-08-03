const expect = require('chai').expect
const snsParser = require('../../dist/parser/sns')
describe('parser', function () {
  describe('sns', function () {
    describe('#parse', function () {
      it('should return message content without the envelope', function () {
        const message = {
          MessageId: '9cd2a24b-20c8-4dfd-b62d-70455837aec3',
          ReceiptHandle: '9cd2a24b-20c8-4dfd-b62d-70455837aec3#108b8f0a-6bc8-4acb-a4bc-198833aab626',
          MD5OfBody: 'df277295a50a1ab4ad101ddce2c0c143',
          Body: JSON.stringify({
            'Type': 'Notification',
            'MessageId': '0a3cbe2d-5bd4-4193-9ac2-ea32dbcba197',
            'TopicArn': 'arn:aws:sns:local:000000000000:local-topic1',
            'Subject': '',
            'Message': 'I am a test message',
            'TimeStamp': '2017-08-03T08:05:42:008Z'
          })
        }

        expect(snsParser.parse(message)).to.equal('I am a test message')
      })

      it('should throw an error if the message is not valid JSON', function () {
        const message = {
          MessageId: '9cd2a24b-20c8-4dfd-b62d-70455837aec3',
          ReceiptHandle: '9cd2a24b-20c8-4dfd-b62d-70455837aec3#108b8f0a-6bc8-4acb-a4bc-198833aab626',
          MD5OfBody: 'df277295a50a1ab4ad101ddce2c0c143',
          Body: 'I am not a JSON'
        }

        expect(() => snsParser.parse(message)).to.throw('The message body was not a valid JSON - maybe it is not comming from SNS')
      })

      it('should throw an error if the massage does note have a field .Message', function () {
        const message = {
          MessageId: '9cd2a24b-20c8-4dfd-b62d-70455837aec3',
          ReceiptHandle: '9cd2a24b-20c8-4dfd-b62d-70455837aec3#108b8f0a-6bc8-4acb-a4bc-198833aab626',
          MD5OfBody: 'df277295a50a1ab4ad101ddce2c0c143',
          Body: JSON.stringify({someProperty: "I am not a valid structure, because I don't contain Message Property"})
        }

        expect(() => snsParser.parse(message)).to.throw('The message did not contain expected field (Message)')
      })
    })
  })
})
