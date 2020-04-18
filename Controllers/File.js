const express = require("express");
const router = express.Router();
const gen = require("shortid");
const AWS = require("aws-sdk");

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
        if (JSON.stringify(data) != '{}')
            return { scs: true, data: data };
        else
            return { scs: false };
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
            url: url,
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
    const dd = await getItem("manosriram");
    return res.json({ data: dd });
    /*
    if (req.files.files.length > 0)
        console.log(req.files.files[0]);
    else
        console.log(req.files.files);
        */
});

module.exports = router;
