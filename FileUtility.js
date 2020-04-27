const AdmZip = require("adm-zip");
const crypto = require("crypto");
const { algorithm } = process.env;
let dp = require("stream").Duplex;
const bufferToStream = buffer => {
    let stream = new dp();
    stream.push(buffer);
    stream.push(null);
    return stream;
};

const getStream = stream => {
    return new Promise(resolve => {
        const chunks = [];

        stream.on("data", chunk => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString()));
    });
};

const zipFile = files => {
    var zipp = new AdmZip();
    if (files.length > 0) {
        for (let t = 0; t < files.length; ++t) {
            zipp.addFile(
                files[t].name,
                Buffer.alloc(files[t].size, files[t].data)
            );
        }
    } else {
        zipp.addFile(files.name, Buffer.alloc(files.size, files.data));
    }
    return zipp;
};

const decryptBuffer = (buffer, pass) => {
    var decipher = crypto.createDecipher(algorithm, pass);
    var dec = Buffer.concat([decipher.update(buffer), decipher.final()]);
    return dec;
};

const encryptBuffer = (buffer, pass) => {
    var cipher = crypto.createCipher(algorithm, pass);
    var crypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return crypted;
};

module.exports = {
    getStream,
    zipFile,
    encryptBuffer,
    decryptBuffer
};
