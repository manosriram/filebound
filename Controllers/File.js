const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const crypto = require("crypto");
const { ALGORITHM } = process.env;
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

const {
    getStream,
    zipFile,
    encryptBuffer,
    decryptBuffer
} = require("./FileUtility");

const awsConfig = require("./configAWS");
AWS.config.update(awsConfig);
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

        if (limit > 262144000)
            return res.json({ scs: false, msg: "250MB capacity exceeded." });
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
        putS3Item(genn, encryptedBuffer, false, function(err, data) {
            if (!err)
                return res.json({
                    scs: true,
                    url: genn + "|" + hashKey,
                    files: req.files.files,
                    expires: fileData.expires,
                    downloads: downloads
                });
            else console.log(err);
        });
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

    let encryptedData = await getS3Item(url + ".zip");
    if (encryptedData.scs) {
        const decryptedData = await decryptBuffer(
            encryptedData.buffer.Body,
            hash
        );
        var zipp = new zip();
        zipp.file("Archive.zip", decryptedData);
        return res.json({ scs: true, data: decryptedData });
    } else res.json({ scs: false, msg: "Link Expired!" });
});

module.exports = router;
