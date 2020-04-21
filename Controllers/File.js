const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const AWS = require("aws-sdk");
const AdmZip = require("adm-zip");
const archiver = require("archiver");
const bcrypt = require("bcryptjs");
const fs = require("fs");
archiver.registerFormat('zip-encrypted', require("archiver-zip-encrypted"));
const {
    encryptFileName,
    getItem,
    putItem,
    updateItem,
    deleteItem
} = require("./Utility");
const awsConfig = require("./configAWS");
AWS.config.update(awsConfig);

let dp = require("stream").Duplex;
function bufferToStream(buffer) {
    let stream = new dp();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

router.post("/upload", async (req, res) => {
    const { expires, downloads } = req.body;
    let password = "";
    if (req.body.password) password = req.body.password;


    const rr = bufferToStream(req.files.files.data);
    rr.on("data", data => console.log(data));
    return;
    var genn = nanoid(32);
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    // putItem(genn, expires, hash, req.files.files, downloads);

    try {
        var zipp = new AdmZip();
        if (req.files.files.length > 0) {
            for (let t = 0; t < req.files.files.length; ++t) {
                zipp.addFile(
                    req.files.files[t].name,
                    Buffer.alloc(
                        req.files.files[t].size,
                        req.files.files[t].data
                    )
                );
            }
        } else {
            zipp.addFile(
                req.files.files.name,
                Buffer.alloc(req.files.files.size, req.files.files.data)
            );
        }
    } catch (er) {
        return res.json({ scs: false, msg: "Some error occured", error: er });
    }

    try {
        const sending = zipp.toBuffer();
        console.log(sending);
        return;
        const s3 = new AWS.S3();
        const params = {
            Bucket: process.env.BUCKET,
            ACL: process.env.ACL,
            Body: sending,
            Key: `${genn}.zip`
        };

        s3.putObject(params, async (err, data) => {
            if (er)
                return res.json({
                    scs: false,
                    msg: "Some error occured",
                    error: er
                });
        });
        return res.json({ scs: true, url: genn });
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
    const { url } = req.body;
    const resp = await getItem(url);
    try {
        if (resp.scs) {
            let { expires } = resp.data.Item;
            created = new Date().getTime();
            expires = new Date(expires).getTime();

            if (expires > created) {
                try {
                    return res.json({ valid: true, data: resp.data.Item });
                } catch (er) {
                    return res.json({
                        scs: false,
                        msg: "Some error occured",
                        error: er
                    });
                }
            } else return res.json({ valid: false, msg: "Link Expired!" });
        } else return res.json({ valid: false, msg: "Link Expired!" });
    } catch (er) {
        return res.json({ valid: false, msg: "Some error occured" });
    }
});

router.post("/list", async (req, res) => {
    const { url } = req.body;
    const resp = await getItem(url);
    return res.json({ names: resp.data.Item.names });
});

router.post("/verifyPassword", async (req, res) => {
    const { password, url } = req.body;
    const resp = await getItem(url);

    if (resp.scs) {
        const hashed = resp.data.Item.password;
        if (bcrypt.compareSync(password, hashed))
            return res.status(201).json({ valid: true });
        else res.status(403).json({ valid: false });
    } else res.status(403).json({ valid: false });
});

router.post("/download", async (req, res) => {
    const { url } = req.body;
    try {
        await updateItem(url);
        return res.json({ scs: true, msg: "Updated!" });
    } catch (er) {
        return res.json({ scs: false, msg: "Some error occured", error: er });
    }
});

module.exports = router;
