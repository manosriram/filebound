const cr = require("crypto");
const hash = cr.randomBytes(32);

console.log(hash.toString('hex'));
