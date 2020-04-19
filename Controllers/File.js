const express = require("express");
const router = express.Router();
const gen = require("shortid");
const AWS = require("aws-sdk");
const JSZip = require("JSZip");
const { saveAs } = require("file-saver");
const fs = require("fs");

let awsConfig = {
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT,
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

const getItem = async url => {
    let docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: "reserve",
        Key: {
            url: url
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

const putItem = async (url, expires) => {
    let docClient = new AWS.DynamoDB.DocumentClient();

    let genn = gen.generate();
    var params = {
        TableName: "reserve",
        Item: {
            url: url.toString(),
            surl: genn,
            valid: true,
            created: Date.now(),
            expires: Date.now()
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
    var zip = new JSZip();
    var stream = fs.createWriteStream("exx.zip", { flags: "a" });

    if (req.files.files.length > 0) {
        for (let t=0;t<req.files.files.length;++t)
            zip.file(req.files.files[t].name, req.files.files[t].data);
    }
    else
        zip.file(req.files.files.name, req.files.files.data);

    zip.generateAsync({ type: "nodebuffer" }).then(file => {
        stream.write(file, function() {
            /*
             * Files zipped, decide what to do. (To be completed yet)
            */
            console.log("Done!");
        });
    });

    return;
    const { expires } = req.body;
    const files = req.files.files;
    /*
    if (req.files.files.length > 0)
        console.log(req.files.files[0]);
    else
        console.log(req.files.files);
        */
});

module.exports = router;
