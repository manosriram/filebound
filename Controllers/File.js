const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const AWS = require("aws-sdk");
const JSZip = require("JSZip");
const { saveAs } = require("file-saver");
const fs = require("fs");
const moment = require("moment");
const https = require("https");
const axios = require("axios");
const path = require("path");
const crypto = require("crypto");
const AdmZip = require("adm-zip");

let awsConfig = {
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
};
AWS.config.update(awsConfig);

/*
 Reserve {
    url -> String:
    surl -> String;
    created -> Date, Primary-Key, default: Date.now();
    expires -> Date;
    isValid -> Boolean
 }
*/

const encryptFileName = name => {
    const key = process.env.SEED32;
    const iv = process.env.SEED16;
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let hex = cipher.update(name, "utf8", "hex");
    enc += cipher.final("hex");
    return enc;
};

const getItem = async surl => {
    let docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: "reserve",
        Key: {
            surl: surl
        }
    };
    try {
        const data = await docClient.get(params).promise();
        if (JSON.stringify(data) != "{}") return { scs: true, data: data };
        else return { scs: false };
    } catch (err) {
        return { scs: false, err: err };
    }
};

const putItem = async (surl, expires, files) => {
    var now = Date.now();
    const exp = now + expires * 60000;
    let docClient = new AWS.DynamoDB.DocumentClient();

    console.log(files);
    let names = [];
    if (files.length > 0) {
        for (let t=0;t<files.length;++t) {
            names.push(files[t].name);
        }
    } else names.push(files.name);

    var params = {
        TableName: "reserve",
        Item: {
            surl: surl,
            valid: true,
            created: now,
            expires: exp,
            names: names
        }
    };
    try {
        const data = await docClient.put(params).promise();
        return { scs: true, surl: genn };
    } catch (err) {
        return { scs: false, err: err };
    }
};

router.post("/upload", async (req, res) => {
    const { expires } = req.body;
    var genn = nanoid(32);
    return res.json({ url: genn });
    putItem(genn, expires, req.files.files);
    var zipp = new AdmZip();

    if (req.files.files.length > 0) {
        for (let t = 0; t < req.files.files.length; ++t) {
            zipp.addFile(
                req.files.files[t].name,
                Buffer.alloc(req.files.files[t].size, req.files.files[t].data)
            );
        }
    } else {
        zipp.addFile(
            req.files.files.name,
            Buffer.alloc(req.files.files.size, req.files.files.data
        ));
    }

    var sending = zipp.toBuffer();
    const s3 = new AWS.S3();
    const params = {
        Bucket: process.env.BUCKET,
        ACL: process.env.ACL,
        Body: sending,
        Key: `${genn}.zip`
    };

    s3.putObject(params, async (err, data) => {
        if (err) console.log(err);
    });
    console.log("Done!");
    return;
    const files = req.files.files;
    /*
    if (req.files.files.length > 0)
        console.log(req.files.files[0]);
    else
        console.log(req.files.files);
        */
});

router.post("/verify", async (req, res) => {
    let { url } = req.body;
    const resp = await getItem(url);
    try {
        if (resp.scs) {
            let { expires } = resp.data.Item;
            created = new Date().getTime();
            expires = new Date(expires).getTime();

            if (expires > created) {
                try {
                    return res.json({ valid: true });
                } catch (er) {
                    console.log(er);
                }
            } else return res.json({ valid: false });
        } else return res.json({ valid: false });
    } catch (er) {
        return res.json({ valid: false, msg: er });
    }
});

router.post("/list", async (req, res) => {
    let { url } = req.body;
    const resp = await getItem(url);
    return res.json({ names: resp.data.Item.names });
});

module.exports = router;
