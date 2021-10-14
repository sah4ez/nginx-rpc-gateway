import axl from 'axlsign.js'
// import crypto from 'crypto'

function ToBase64 (u8) {
  return Buffer.from(String.fromCharCode.apply(null, u8)).toString('base64url')
}

function testEcdh (r) {
  const seed1 = Buffer.from(r.headersIn['X-Request-Id'])
  const seed2 = new Uint8Array(32)
  for (let i = 0; (i < seed1.length && i < seed2.length) ; i++) {
    seed2[i] = seed1[i]
  }
  const keyPair1 = axl.generateKeyPair(seed2)
  const keyPair2 = axl.generateKeyPair(seed2)
  const pairs1 = ToBase64(keyPair1.public) + ':::' + ToBase64(keyPair2.public)
  const pairs2 = ToBase64(keyPair1.private) + ':::' + ToBase64(keyPair2.private)

  const shk1 = axl.sharedKey(keyPair1.private, keyPair2.public)
  const shk2 = axl.sharedKey(keyPair2.private, keyPair1.public)

  r.return(200, ToBase64(shk1) + '::::' + ToBase64(shk2) + ':::' + pairs1 + ':::' + pairs2)
}

export default { testEcdh }
