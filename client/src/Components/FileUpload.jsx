import React, { Fragment, useState } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState([]);
    const [exp, setExp] = useState(5);

    const handleExp = e => {
        setExp(e.target.value);
    };

    const handleChange = e => {
        let fileList = [];
        fileList = e.target.files;
        for (let t = 0; t < fileList.length; ++t)
            setFile(file => [...file, fileList[t]]);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const fd = new FormData();
        for (let t = 0; t < file.length; ++t) fd.append("files", file[t]);

        fd.append("expires", exp);
        try {
            const resp = axios
                .post("/file/upload", fd, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                .then(res2 => document.write(JSON.stringify(res2.data)));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Fragment>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    multiple="multiple"
                    onChange={e => handleChange(e)}
                />
                <br />
                {file.map((fl, inn) => {
                    return (
                        <Fragment>
                            <h3>{fl.name}</h3>
                        </Fragment>
                    );
                })}
                <select id="" name="exp" onChange={handleExp}>
                    <option value="5">5 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="150">2.5 Hours</option>
                </select>
                <br />
                <input type="submit" value="Upload" />
            </form>
        </Fragment>
    );
};

export default FileUpload;
