import util from 'util_rpc.js'

const methods = {
  'abc.def': true,
  'abc.fed': true,
  'abc.abc': false
}

function allowed (req, reject) {
  const method = req.method
  if (methods[method]) {
    return
  }
  reject(util.makeErrorResponse(req, -32601, 'Method not found'))
};

const skipMethodCheck = {
  'abc.def': true
}

function checkValue (req, reject) {
  const method = req.method
  if (!skipMethodCheck[method]) {
    return
  }

  // TODO: move check params to map like
  // {json_path: error}
  if (req.params.abc === 'cba') {
    reject(util.makeErrorResponse(req, -32601, 'Bad request'))
  }
};

export default { allowed, checkValue }
