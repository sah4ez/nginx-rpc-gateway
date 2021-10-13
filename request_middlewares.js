function checkStatus (r, resp) {
  if (resp.status === 401) {
    r.return(resp.status, '401 unauthorized')
  }
}

function doRequest (url, body) {
  return ngx.fetch(url, body) // eslint-disable-line
}

function introspect (r) {
  const url = 'http://127.0.0.1:8083/introspect'
  const body = { method: 'GET' }
  return doRequest(url, body)
    .then(resp => checkStatus(r, resp))
    .catch(err => r.return(500, 'Internal error: ' + err))
}

const middlewares = [
  introspect
]

export default { middlewares, introspect }
