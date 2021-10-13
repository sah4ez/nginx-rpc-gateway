function makeErrorResponse (req, code, error) {
  return {
    id: req.id,
    jsonrpc: req.jsonrpc,
    error: { code: code, message: error }
  }
};

function toBody (req, method) {
  const jsonObj = {
    id: req.id,
    method: method,
    params: req.params,
    jsonrpc: req.jsonrpc
  }
  return JSON.stringify(jsonObj)
}

export default { makeErrorResponse, toBody }
