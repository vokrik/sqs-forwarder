module.exports = (req) => {
  let result = JSON.parse(JSON.stringify(req)) // deep clone
  try {
    result.data = JSON.parse(req.data.Body).Message
  } catch (err) {
    throw new Error('The message body was not a valid JSON - maybe it is not comming from SNS')
  }
  if (!result.data) {
    throw new Error('The message did not contain expected field (Message)')
  }
  return result
}
