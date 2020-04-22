const AWS = require("aws-sdk");
const TABLE = process.env.TABLE;
const awsConfig = require("./configAWS");
AWS.config.update(awsConfig);
const docClient = new AWS.DynamoDB.DocumentClient();

const getItem = async surl => {
    const params = {
        TableName: TABLE,
        Key: {
            surl: surl
        }
    };
        const data = await docClient.get(params).promise();
        if (JSON.stringify(data) != "{}") return { scs: true, data: data };
        else return { scs: false, msg: "Link Expired!" };
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

const updateItem = async url => {
    try {
        const itemMetaData = await getItem(url);
    } catch (er) {
        return { scs: false, msg: "Some error occured", error: er };
    }
    const params = {
        TableName: TABLE,
        Key: {
            surl: url
        },
        UpdateExpression: "set downloads = :n",
        ExpressionAttributeValues: {
            ":n": itemMetaData.data.Item.downloads - 1
        },
        ReturnValues: "UPDATED_NEW"
    };
    try {
        const resp = await docClient.update(params).promise();
        if (resp.Attributes.downloads === 0) await deleteItem(url);

        return { scs: true, err: "Updated" };
    } catch (er) {
        return { scs: false, msg: "Some error occured", error: er };
    }
};

const putItem = async (surl, expires, password, files, downloads) => {
    let now = Date.now();
    const exp = now + expires * 60000;
    let docClient = new AWS.DynamoDB.DocumentClient();
    let names = [];

    try {
        if (files.length > 0) {
            for (let t = 0; t < files.length; ++t) {
                names.push(files[t].name);
            }
        } else names.push(files.name);
    } catch (er) {
        return { scs: false, msg: "Some error occured", error: er };
    }

    const params = {
        TableName: TABLE,
        Item: {
            surl: surl,
            valid: true,
            created: now,
            expires: exp,
            names: names,
            password: password == '' ? false : password,
            downloads: downloads
        }
    };
    try {
        const data = await docClient.put(params).promise();
        return { scs: true, surl: genn };
    } catch (err) {
        return { scs: false, err: err };
    }
};

module.exports = {
    getItem: getItem,
    putItem: putItem,
    updateItem: updateItem,
    deleteItem: deleteItem
};
