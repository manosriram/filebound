const express = require("express");
const router = express.Router();
const gen = require("shortid");
const AWS = require("aws-sdk");
const JSZip = require("JSZip");
const { saveAs } = require("file-saver");
const fs = require("fs");
const moment = require("moment");

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

const putItem = async (surl, expires) => {
    var now = Date.now();
    const exp = now + (expires * 60000); // Minutes
    let docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: "reserve",
        Item: {
            surl: surl,
            valid: true,
            created: now,
            expires: exp
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
    console.log(expires);

    return;
    var genn = gen.generate();
    putItem(genn, expires);

    var zip = new JSZip();
    var stream = fs.createWriteStream("exx.zip", { flags: "a" });

    if (req.files.files.length > 0) {
        for (let t = 0; t < req.files.files.length; ++t)
            zip.file(req.files.files[t].name, req.files.files[t].data);
    } else zip.file(req.files.files.name, req.files.files.data);

    zip.generateAsync({ type: "nodebuffer" }).then(file => {
        stream.write(file, function() {
            /*
             * Files zipped, decide what to do. (To be completed yet)
             */

            const s3 = new AWS.S3();
            const params = {
                Bucket: process.env.BUCKET,
                ACL: process.env.ACL,
                Body: file,
                Key: `${genn}.zip`
            };

            s3.putObject(params, async (err, data) => {
                if (err) console.log(err);
                else {
                    const url = `${process.env.BASE_URL}/${genn}.zip`;
                    putItem(genn, expires);
                }
            });
            console.log("Done!");
        });
    });

    return;
    const files = req.files.files;
    /*
    if (req.files.files.length > 0)
        console.log(req.files.files[0]);
    else
        console.log(req.files.files);
        */
});

router.get("/getFiles", async (req, res) => {
    //    const { surl } = req.body;
    //    const url = `${process.env.BASE_URL}/${surl}.zip`;
    console.log(await getItem("kgzg0o4Fs"));
});

module.exports = router;
