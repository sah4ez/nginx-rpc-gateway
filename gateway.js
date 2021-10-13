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
      .then((reply) => reply.text())
      .then((rr) => resolve(JSON.parse(rr)))
      .catch((err) => reject(err))
  })
  promises.push(p)
}

function checkResult (result, resp) {
  if (result.value === undefined) {
    resp.push(result.reason)
  } else {
    resp.push(result.value)
  }
}

function JSONgateway (r) {
  const resp = []
  middlewares.forEach((middleware) => middleware(r))

  const promises = []
  JSON.parse(r.requestText).map(req => ParseRequest(r, req, promises))

  return Promise.allSettled(promises)
    .then((results) => {
      results.forEach(result => checkResult(result, resp))
    }).then((rr) => r.return(200, JSON.stringify(resp)))
};

export default { JSONgateway }
