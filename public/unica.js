const crypto = require('crypto')
const segredo = crypto.randomBytes(32).toString('hex');
console.log(segredo)