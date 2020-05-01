const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const crypto = require("crypto");
const { ALGORITHM } = process.env;
const AdmZip = require("adm-zip");
const dd = require("detect-character-encoding");

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

const {
    getStream,
    zipFile,
    encryptBuffer,
    decryptBuffer
} = require("./FileUtility");

const awsConfig = require("./configAWS");
AWS.config.update(awsConfig);
const s3 = new AWS.S3({ apiVersion: "2012-08-10" });
const docClient = new AWS.DynamoDB.DocumentClient();

router.post("/upload", async (req, res) => {
    const { expires, downloads } = req.body;
    let password = "";

    if (!req.files) return res.json({ scs: false, msg: "No files uploaded." });

    if (req.body.password) {
        if (req.body.password.length < 4)
            return res.json({ scs: false, msg: "Password too short" });
        password = req.body.password;
    }
    try {
        var zippedFile = zipFile(req.files.files).toBuffer();
        console.log(zippedFile);
        var hashKey = crypto.randomBytes(32).toString("hex");

        var encryptedBuffer = encryptBuffer(zippedFile, hashKey);
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

        if (limit > 100000000)
            return res.json({ scs: false, msg: "150MB capacity exceeded." });
    } catch (err) {
        return res.json({ scs: false, msg: "Some error occured!" });
    }

    const fileData = await putItem(
        genn,
        expires,
        password,
        req.files.files,
        downloads
    );
    try {
        const params = {
            Bucket: process.env.BUCKET,
            ACL: process.env.ACL,
            Body: encryptedBuffer,
            Key: `${genn}.zip`
        };

        const awsResp = await s3.upload(params).promise();
        if (!isEmpty(awsResp)) {
            return res.json({
                scs: true,
                url: genn + "|" + hashKey,
                expires: fileData.expires,
                downloads: downloads
            });
        } else return res.json({ scs: false, msg: "Some error occured" });
    } catch (err) {
        console.log(err);
        return res.json({ scs: false, msg: "Some error occured", error: er });
    }
});

router.post("/verifyLink", async (req, res) => {
    const { url } = req.body;
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
        console.log(er);
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
    url += ".zip";
    const params = {
        Bucket: process.env.BUCKET,
        Key: url
    };
    const encrypted = await getObject(url);
    const decrypted = await decryptBuffer(encrypted, hash);
    res.write(decrypted);
    res.end();
});

module.exports = router;
