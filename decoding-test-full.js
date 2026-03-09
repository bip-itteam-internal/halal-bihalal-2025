function encodeUUID(uuid) {
  if (!uuid) return ''
  const hex = uuid.replace(/-/g, '')
  if (hex.length !== 32) return uuid

  const buffer = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    buffer[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }

  const b64 = Buffer.from(buffer).toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeUUID(base64url) {
  if (!base64url || base64url.length !== 22) return base64url

  let b64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) {
    b64 += '='
  }

  try {
    const bin = Buffer.from(b64, 'base64')
    if (bin.length !== 16) return base64url

    let hex = ''
    for (let i = 0; i < bin.length; i++) {
      const charCode = bin[i].toString(16)
      hex += charCode.length === 1 ? '0' + charCode : charCode
    }

    return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`
  } catch {
    return base64url
  }
}

// Function with string.fromCharCode symmetry
function decodeUUID_BrowserSymmetry(base64url) {
  if (!base64url || base64url.length !== 22) return base64url

  let b64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) {
    b64 += '='
  }

  try {
    const bin = atob(b64)
    if (bin.length !== 16) return base64url

    let hex = ''
    for (let i = 0; i < bin.length; i++) {
      const charCode = bin.charCodeAt(i).toString(16)
      hex += charCode.length === 1 ? '0' + charCode : charCode
    }

    return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`
  } catch (e) {
    return `ERROR: ${e.message}`
  }
}

// We simulate 'atob' and 'btoa' if using browser logic
const atob = (str) => Buffer.from(str, 'base64').toString('binary')
const btoa = (str) => Buffer.from(str, 'binary').toString('base64')

const testUuid = 'd5a69364-3a91-4f27-9ce4-d23567623d92' // Example from a common bit structure
const encoded = encodeUUID(testUuid)
const decoded = decodeUUID(encoded)
const decodedBrowser = decodeUUID_BrowserSymmetry(encoded)

console.log('Original:      ', testUuid)
console.log('Encoded:       ', encoded)
console.log('Decoded Node:  ', decoded)
console.log('Decoded Browser:', decodedBrowser)
console.log('Match Node:    ', testUuid === decoded)
console.log('Match Browser: ', testUuid === decodedBrowser)

// Let's decode the user's specific hash
const userHash = '1a1WtDOqT_iznUYN1pZniQ'
console.log('User Hash:', userHash)
console.log('Decoded User Hash:', decodeUUID(userHash))
console.log('Decoded Browser User Hash:', decodeUUID_BrowserSymmetry(userHash))
