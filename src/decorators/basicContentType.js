module.exports = (req) => {
  let result = JSON.parse(JSON.stringify(req)) // deep clone
  if (!result.headers) {
    result.headers = {}
  }
  if (!result.headers.hasOwnProperty('Content-type')) {
    try {
      JSON.parse(req.data) // Check, if it throws an exception (usual way of checking for JSON)
      result.headers['Content-type'] = 'application/json'
    } catch (err) {
      result.headers['Content-type'] = 'text/plain'
    }
  }
  return result
}
