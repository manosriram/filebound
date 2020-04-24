const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const AWS = require("aws-sdk");
const AdmZip = require("adm-zip");
const archiver = require("archiver");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const crypto = require("crypto");
const https = require("https");
const request = require("request");
archiver.registerFormat("zip-encrypted", require("archiver-zip-encrypted"));
const download = require("download");
const { algorithm } = process.env;
const zip = require("jszip");

const {
    encryptFileName,
    getItem,
    putItem,
    updateItem,
    deleteItem,
    getObject,
    putS3Item,
    getS3Item,
    isEmpty,
    deleteS3Item
} = require("./Utility");
const awsConfig = require("./configAWS");
AWS.config.update(awsConfig);
const docClient = new AWS.DynamoDB.DocumentClient();

let dp = require("stream").Duplex;
function bufferToStream(buffer) {
    let stream = new dp();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

function getStream(stream) {
    return new Promise(resolve => {
        const chunks = [];

        stream.on("data", chunk => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString()));
    });
}

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

router.post("/upload", async (req, res) => {
    const { expires, downloads } = req.body;
    let password = "";

    if (!req.files) return res.json({ scs: false, msg: "No files uploaded." });

    if (req.body.password) {
        if (req.body.password.length < 4)
            return res.json({ scs: false, msg: "Password too short" });
        password = req.body.password;
    }

    const zippedFile = zipFile(req.files.files).toBuffer();
    const hashKey = crypto.randomBytes(32).toString('hex');

    let encryptedBuffer = encryptBuffer(zippedFile, hashKey);
    var genn = nanoid(32);

    if (password) {
        var salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);
    }

    let limit = 0;
    if (req.files.files.length > 0) {
        for (let t = 0; t < req.files.files.length; ++t)
            limit += req.files.files[t].size;
    } else limit = req.files.files.size;

    if (limit > 1073741824)
        return res.json({ scs: false, msg: "1GB capacity exceeded." });

    putItem(genn, expires, password, req.files.files, downloads);
    try {
        putS3Item(genn, encryptedBuffer, false, function(err, data) {
            if (!err) return res.json({ scs: true, url: genn + '|' + hashKey });
            else console.log(err);
        });
    } catch (er) {
        return res.json({ scs: false, msg: "Some error occured", error: er });
    }
    /*
    if (req.files.files.length > 0)
        console.log(req.files.files[0]);
    else
        console.log(req.files.files);
        */
});

router.post("/verifyLink", async (req, res) => {
    const { url } = req.body; // no .zip
    try {
        getItem(url, resp => {
            if (!isEmpty(resp)) {
                let { expires } = resp.Item;
                created = new Date().getTime();
                expires = new Date(expires).getTime();

                if (expires > created || resp.downloads == 0)
                    return res.json({ valid: true, data: resp.Item });
                else {
                    deleteS3Item(url + ".zip");
                    deleteItem(url);
                    return res.json({ valid: false, msg: "Link Expired!" });
                }
            } else return res.json({ valid: false, msg: "Link Expired!" });
        });
    } catch (er) {
        return res.json({ valid: false, msg: "Link Expired!" });
    }
});

router.post("/list", async (req, res) => {
    const { url } = req.body;
    getItem(url, resp => {
        return res.json({ names: resp.data.Item.names });
    });
});

router.post("/verifyPassword", async (req, res) => {
    const { password, url } = req.body;
    getItem(url, resp => {
        if (resp.Item.valid) {
            const hashed = resp.Item.password;
            if (bcrypt.compareSync(password, hashed))
                return res.status(201).json({ valid: true });
            else res.status(403).json({ valid: false });
        } else res.status(403).json({ valid: false });
    });
});

router.post("/download", async (req, res) => {
    const { url } = req.body;
    try {
        const dd = await updateItem(url);
        return res.json({ scs: true, msg: "Updated!" });
    } catch (er) {
        return res.json({ scs: false, msg: "Link Expired!", error: er });
    }
});

router.post("/decryptFile", async (req, res) => {
    let { url, hash } = req.body;

    const encryptedData = await getS3Item(url + '.zip');
    if (encryptedData.scs) {
        const decryptedData = await decryptBuffer(
            encryptedData.buffer.Body,
            hash
        );
        var zipp = new zip();
        zipp.file("download.zip", decryptedData);
        return res.json({ scs: true, data: decryptedData });
    } else
        res.json({ scs: false, msg: "Link Expired!" });
});
module.exports = router;

/*
        const encryptedData = await getS3Item(url + ".zip");
        const decryptedData = await decryptBuffer(
            encryptedData.buffer.Body,
            "123"
        );
        var zipp = new zip();
        zipp.file("download.zip", decryptedData);
        return res.json({ scs: true, data: decryptedData});

        */
