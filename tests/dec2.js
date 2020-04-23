var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';
const AdmZip = require("adm-zip");

var fs = require('fs');
var zlib = require('zlib');

var r = fs.createReadStream('dec.zip');

r.on("data", d => {
    console.log(d);
});
