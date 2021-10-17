import axl from 'axlsign.js'

function ToBase64 (u8) {
  return Buffer.from(String.fromCharCode.apply(null, u8)).toString('base64url')
}

function testEcdh (r) {
  const buf = crypto.getRandomValues(new Uint8Array(32))
  const keyPair1 = axl.generateKeyPair(buf)
  const keyPair2 = axl.generateKeyPair(buf)
  const pairs1 = ToBase64(keyPair1.public) + ':::' + ToBase64(keyPair2.public)
  const pairs2 = ToBase64(keyPair1.private) + ':::' + ToBase64(keyPair2.private)

  const shk1 = axl.sharedKey(keyPair1.private, keyPair2.public)
  const shk2 = axl.sharedKey(keyPair2.private, keyPair1.public)

  r.return(200, ToBase64(shk1) + '::::' + ToBase64(shk2) + ':::' + pairs1 + ':::' + pairs2 + ':::' + ToBase64(buf))
}

export default { testEcdh }
