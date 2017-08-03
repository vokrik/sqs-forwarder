module.exports = {
  parse: (message) => {
    let result
    try {
      result = JSON.parse(message.Body).Message
    } catch (err) {
      throw new Error('The message body was not a valid JSON - maybe it is not comming from SNS')
    }
    if (!result) {
      throw new Error('The message did not contain expected field (Message)')
    }
    return result
  }
}
