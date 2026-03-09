const { encodeUUID, decodeUUID } = require('./src/lib/utils-tests.js')

const testUuid = '69ad66b4-3a8e-4f38-9ce4-d635d6966789' // Example
const encoded = encodeUUID(testUuid)
const decoded = decodeUUID(encoded)

console.log('Original:', testUuid)
console.log('Encoded:', encoded)
console.log('Decoded:', decoded)
console.log('Match:', testUuid === decoded)
