/*
 * dummy echo method
* */
function echo (r) {
  const b = JSON.parse(r.requestText)
  r.return(200, JSON.stringify({
    id: b.id,
    jsonrpc: b.jsonrpc,
    result: {
      abc: b.params.abc
    }
  }))
}

export default { echo }
