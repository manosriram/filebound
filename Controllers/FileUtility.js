const AdmZip = require("adm-zip");
const crypto = require("crypto");
const { ALGORITHM } = process.env;
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
    try {
        const decipher = crypto.createDecipher(ALGORITHM, pass);
        const decrypted = Buffer.concat([
            decipher.update(buffer),
            decipher.final()
        ]);
        return decrypted;
    } catch (err) {
        console.log(err);
    }
};

const encryptBuffer = (buffer, pass) => {
    try {
        const cipher = crypto.createCipher(ALGORITHM, pass);
        const encrypted = Buffer.concat([
            cipher.update(buffer),
            cipher.final()
        ]);
        return encrypted;
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    getStream,
    zipFile,
    encryptBuffer,
    decryptBuffer
};
