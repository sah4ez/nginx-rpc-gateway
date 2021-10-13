function loadMethod (r, req) {
  let method = req.method
  const parts = String(method).split('.')
  if (parts.length === 3) {
    method = parts[2]
  }
  return method
}

function loadURL (r, req) {
  let method = req.method
  const parts = String(method).split('.')
  if (parts.length === 3) {
    method = parts[2]
  }

  const url = 'http://127.0.0.1:8083/' + parts[0] + '/' + parts[1]
  return url
}

export default { loadMethod, loadURL }
