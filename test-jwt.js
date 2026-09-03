const crypto = require('crypto');
const SECRET = 'nihad-kp-dev-secret-change-me-in-production-please';

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const b64urlJson = (obj) => b64url(JSON.stringify(obj))
function fromB64url(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString()
}

function signJwt(payload, days = 7) {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + days * 24 * 3600
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' })
  const body = b64urlJson({ ...payload, iat, exp })
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest())
  return `${header}.${body}.${sig}`
}

function verifyJwt(token) {
  try {
    const [header, body, sig] = token.split('.')
    if (!header || !body || !sig) return null
    const expected = b64url(
      crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest()
    )
    if (expected.length !== sig.length) return null
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null
    const payload = JSON.parse(fromB64url(body))
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch(e) {
    console.error(e)
    return null
  }
}

const token = signJwt({ sub: '123', email: 'test@example.com', role: 'ADMIN' });
console.log('Token:', token);
const verified = verifyJwt(token);
console.log('Verified:', verified);
