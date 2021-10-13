import e from 'external.js'
import rw from 'request_middlewares.js'
import b from 'balancing.js'
import utils from 'util_rpc.js'

const middlewares = [rw.introspect]

const rpcRequestMiddlewares = [
  e.allowed,
  e.checkValue
]

function DoRequest (url, method, req) {
  const body = { method: 'POST', body: utils.toBody(req, method) }
  return ngx.fetch(url, body) // eslint-disable-line
}

function ParseRequest (r, req, promises) {
  const p = new Promise((resolve, reject) => {
    rpcRequestMiddlewares.forEach((middleware) => middleware(req, reject))

    DoRequest(b.loadURL(r, req), b.loadMethod(r, req), req)
      .then(reply => reply.text())
      .then(rr => resolve(JSON.parse(rr))) // will recived in the checkResult in the success case
      .catch(err => reject(err)) // will recieved in the failed case of the checkResult
  })
  promises.push(p)
}

function checkResults (results, resp) {
  results.forEach(result => {
    // result contains or value for success response, or reason for failed
    if (result.value === undefined) {
      resp.push(result.reason)
    } else {
      resp.push(result.value)
    }
  })
}

function JSONgateway (r) {
  const resp = []
  // the each middleware function to apply on the request r
  // if middleware failed would return error from the method
  middlewares.forEach((middleware) => middleware(r))

  const promises = []
  // per each request in the batch will processed through ParseRequest
  // and for failed processing will call reject method of the promis
  JSON.parse(r.requestText).map(req => ParseRequest(r, req, promises))

  return Promise.allSettled(promises) // wait all promises and return response
    .then(results => checkResults(results, resp))
    .then(success => r.return(200, JSON.stringify(resp)))
};

export default { JSONgateway }
