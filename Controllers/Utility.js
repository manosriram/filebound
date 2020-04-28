const AWS = require("aws-sdk");
const TABLE = process.env.TABLE;
let awsConfig = {
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const s3 = new AWS.S3({ apiVersion: "2012-08-10" });

const isEmpty = obj => {
    return JSON.stringify(obj) == "{}";
};

const getS3Item = async url => {
    const params = {
        Bucket: process.env.BUCKET,
        Key: url
    };

    try {
        const buffer = await s3.getObject(params).promise();
        return { buffer: buffer, scs: true };
    } catch (er) {
        return { scs: false, code: er.code };
    }
};

const putS3Item = (genn, data, dec, cb) => {
    const params = {
        Bucket: process.env.BUCKET,
        ACL: process.env.ACL,
        Body: data,
        Key: dec == true ? `${genn}` : `${genn}.zip`
    };

    s3.putObject(params, async (err, data) => {
        return cb(err, data);
    });
};

const getItem = async (surl, cb) => {
    const params = {
        TableName: TABLE,
        Key: {
            surl: surl
        }
    };
    docClient.get(params, (err, data) => {
        cb(data);
    });
};

const deleteItem = async url => {
    const params = {
        TableName: TABLE,
        Key: {
            surl: url
        }
    };
    try {
        const resp = await docClient.delete(params).promise();
        return { scs: true, msg: "Succesfully deleted!" };
    } catch (er) {
        return { scs: false, msg: "Some error occured", error: er };
    }
};

const deleteS3Item = url => {
    const params = {
        Bucket: process.env.BUCKET,
        Key: url
    };

    s3.deleteObject(params, async (err, data) => {
        console.log("deleted");
        if (!err) return { scs: true, msg: "Deleted!" };
    });
};

const updateItem = async url => {
    getItem(url, async cbResponse => {
        if (isEmpty(cbResponse)) return { scs: false, msg: "Link Expired" };

        const params = {
            TableName: TABLE,
            Key: {
                surl: url
            },
            UpdateExpression: "set downloads = :n",
            ExpressionAttributeValues: {
                ":n": cbResponse.Item.downloads - 1
            },
            ReturnValues: "UPDATED_NEW"
        };
        try {
            const resp = await docClient.update(params).promise();
            if (resp.Attributes.downloads === 0) {
                await deleteItem(url);
                await deleteS3Item(url);
            }
            return { scs: true, err: "Updated" };
        } catch (er) {
            return { scs: false, msg: "Link Expired", error: er };
        }
    });
};

const putItem = async (surl, expires, password, files, downloads) => {
    let now = Date.now();
    const exp = now + expires * 60000;
    let names = [];

    try {
        if (files.length > 0) {
            for (let t = 0; t < files.length; ++t) {
                names.push(files[t].name);
            }
        } else names.push(files.name);
    } catch (er) {
        return { scs: false, msg: "Unable to upload data", error: er };
    }

    const params = {
        TableName: TABLE,
        Item: {
            surl: surl,
            valid: true,
            created: now,
            expires: exp,
            names: names,
            password: password == "" ? false : password,
            downloads: downloads
        }
    };
    try {
    const data = await docClient.put(params).promise();
    return { scs: true, surl: surl, expires: exp };
    } catch (err) {
        return { scs: false, msg: "Unable to upload data." };
    }
};

const getObject = async url => {
    url = url + ".zip";
    const s3 = new AWS.S3();
    try {
        const params = {
            Bucket: process.env.BUCKET,
            Key: url
        };
        const data = await s3.getObject(params).promise();
        return data.Body;
    } catch (er) {
        console.log(er);
    }
};

module.exports = {
    getItem: getItem,
    putItem: putItem,
    updateItem: updateItem,
    deleteItem: deleteItem,
    getObject: getObject,
    putS3Item: putS3Item,
    getS3Item: getS3Item,
    isEmpty: isEmpty,
    deleteS3Item: deleteS3Item
};
