const sqsToHttpFactory = require('../dist/index')

const sqsToHttp = sqsToHttpFactory({
  sqs: {
    url: "http://localhost:4100/queue/local-queue3",
  },
  http: {
    url: "http://localhost:3000"
  }
})

sqsToHttp.process(sqsToHttp.snsMessageParser)
